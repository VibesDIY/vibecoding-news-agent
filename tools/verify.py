#!/usr/bin/env python3
"""The verification gate. Nothing gets ranked until it passes through here.

Usage:
  verify.py list   [--vibe handle/app-slug]        entities waiting on a check
  verify.py show   <slug> [--vibe ...]             one entity's measured row
  verify.py confirm <slug> --note "..." [--vibe ...]
  verify.py reject  <slug> --note "..." [--vibe ...]

What a check is. The corpus can tell you an entity is mentioned 8,322 times at
+0.198 sentiment. It cannot tell you the entity exists, is still running, or is
the thing you think it is. So a person or an agent with a search tool confirms
that separately and writes down what they found, in --note, which the report
carries next to the number.

Rejecting is a real outcome and it stays in the data. An entity that turned out
to be a misparse, a duplicate spelling or a dead product is worth recording so
the next pass does not spend the check again.

Ranking reads only the confirmed rows. Everything else is counted on the page
as unverified, so a reader can see how much of the table has been checked.
"""
import json, subprocess, sys

CLI = ["npx", "-y", "vibes-diy@latest"]


def cli(args, vibe, stdin=None):
    cmd = CLI + args
    if vibe:
        cmd += ["--vibe", vibe]
    res = subprocess.run(cmd, input=stdin, text=True, capture_output=True)
    if res.returncode != 0:
        print(res.stderr.strip()[:600])
        sys.exit(1)
    return res.stdout


def entities(vibe):
    out = cli(["db", "query", "type", "--db", "findings", "--key", '"entity"', "--json"], vibe)
    rows = []
    for line in out.splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            rows.append(json.loads(line))
        except ValueError:
            pass
    return rows


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    vibe = sys.argv[sys.argv.index("--vibe") + 1] if "--vibe" in sys.argv else None
    note = sys.argv[sys.argv.index("--note") + 1] if "--note" in sys.argv else None

    if cmd == "list":
        rows = sorted(entities(vibe), key=lambda r: -(r.get("mentions") or 0))
        for r in rows:
            mark = "ok " if r.get("verified") else "?  "
            print(f"{mark}{r['_id'][7:]:<28} {r.get('mentions'):>7} mentions  sentiment {r.get('sentiment')}")
        print(f"\n{sum(1 for r in rows if not r.get('verified'))} of {len(rows)} still unverified")
        return

    if cmd == "show":
        arg = sys.argv[2]
        doc = cli(["db", "get", arg if arg.startswith("entity:") else "entity:" + arg,
                   "--db", "findings", "--json"], vibe)
        print(doc)
        return

    if cmd in ("confirm", "reject"):
        if not note:
            print("a --note is required: say what you checked and where you checked it")
            sys.exit(2)
        slug = sys.argv[2]
        doc_id = slug if slug.startswith("entity:") else "entity:" + slug
        raw = cli(["db", "get", doc_id, "--db", "findings", "--json"], vibe)
        doc = json.loads([l for l in raw.splitlines() if l.strip().startswith("{")][0])
        doc["verified"] = cmd == "confirm"
        doc["verifiedNote"] = note
        cli(["db", "put", "--db", "findings", "-"], vibe, stdin=json.dumps(doc))
        print(f"{doc_id}: {'confirmed' if cmd == 'confirm' else 'rejected'}")
        return

    print(__doc__)
    sys.exit(2)


if __name__ == "__main__":
    main()
