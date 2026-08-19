#!/usr/bin/env python3
"""Copy a report out of the running app and into this repo.

Usage: export.py <outdir> [--vibe handle/app-slug] [--day YYYY-MM-DD]

The app is where a report is published. The repo is where it is kept, next to
the raw answers it was built from, so a reader can check a number without
having to trust the page it appeared on. This script writes:

  <outdir>/report.json     the generator's own draft report document
  <outdir>/report.md       the same thing as a readable table
  <outdir>/entities.json   every measured entity, verified or not
  <outdir>/findings.json   every extracted lead

Raw corpus answers belong beside these, copied from wherever tools/vg.py
saved them.
"""
import json, os, subprocess, sys

CLI = ["npx", "-y", "vibes-diy@latest"]


def cli(args, vibe):
    cmd = CLI + args + (["--vibe", vibe] if vibe else [])
    res = subprocess.run(cmd, text=True, capture_output=True)
    if res.returncode != 0:
        print(res.stderr.strip()[:600])
        sys.exit(1)
    return res.stdout


def docs(out):
    """The CLI prints a JSON array or one object; take whichever came back."""
    start = out.find("[")
    obj = out.find("{")
    if start == -1 or (obj != -1 and obj < start):
        start = obj
    if start == -1:
        return []
    parsed = json.loads(out[start:])
    return parsed if isinstance(parsed, list) else [parsed]


def table(rows, cols):
    head = "| " + " | ".join(c[0] for c in cols) + " |"
    rule = "|" + "|".join("---" for _ in cols) + "|"
    body = ["| " + " | ".join(str(r.get(c[1], "") or "") for c in cols) + " |" for r in rows]
    return "\n".join([head, rule] + body)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    outdir = sys.argv[1]
    vibe = sys.argv[sys.argv.index("--vibe") + 1] if "--vibe" in sys.argv else None
    day = sys.argv[sys.argv.index("--day") + 1] if "--day" in sys.argv else None
    os.makedirs(outdir, exist_ok=True)

    reports = docs(cli(["db", "query", "type", "--db", "findings", "--key", '"report"', "--json"], vibe))
    if day:
        reports = [r for r in reports if r.get("day") == day]
    if not reports:
        print("no report in the app yet")
        sys.exit(1)
    report = sorted(reports, key=lambda r: r.get("day", ""))[-1]

    entities = docs(cli(["db", "query", "type", "--db", "findings", "--key", '"entity"', "--json"], vibe))
    findings = docs(cli(["db", "query", "type", "--db", "findings", "--key", '"finding"', "--json"], vibe))

    json.dump(report, open(os.path.join(outdir, "report.json"), "w"), indent=2)
    json.dump(sorted(entities, key=lambda e: -(e.get("mentions") or 0)),
              open(os.path.join(outdir, "entities.json"), "w"), indent=2)
    json.dump(findings, open(os.path.join(outdir, "findings.json"), "w"), indent=2)

    counts = report.get("counts", {})
    md = [
        f"# Draft report {report.get('day')}",
        "",
        f"Generated {report.get('generatedAt')} by the scheduled generator in `vibe/`.",
        "",
        "**This is analysis, not a post.** " + report.get("proseNote", ""),
        "",
        f"{counts.get('entities', 0)} measured entities, {counts.get('ranked', 0)} confirmed, "
        f"{counts.get('unverified', 0)} not yet checked, {counts.get('leads', 0)} leads "
        f"from {counts.get('sources', 0)} corpus answers.",
        "",
        "Mention counts below are index-wide. They measure how much r/vibecoding discusses each tool "
        "overall, not how it came up in the questions behind this report.",
        "",
        "## Counted and confirmed",
        "",
        table(report.get("ranked") or [], [("Entity", "entity"), ("Mentions", "mentions"),
                                           ("Sentiment", "sentiment"), ("Checked", "verifiedNote")])
        or "Nothing has passed the verification gate yet.",
        "",
        "## Counted, not yet checked",
        "",
        table(report.get("unverified") or [], [("Entity", "entity"), ("Mentions", "mentions"),
                                               ("Sentiment", "sentiment")]),
        "",
        "## Leads",
        "",
        "Claims pulled from a synthesis. Pointers to threads, not measurements.",
        "",
    ]
    for lead in report.get("leads") or []:
        links = " ".join(f"[source]({u})" for u in (lead.get("permalinks") or []))
        md.append(f"- **{lead.get('entity')}** {lead.get('claim')} {links}".rstrip())
    open(os.path.join(outdir, "report.md"), "w").write("\n".join(md) + "\n")
    print(f"wrote {outdir}/report.md")


if __name__ == "__main__":
    main()
