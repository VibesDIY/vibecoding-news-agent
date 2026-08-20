#!/usr/bin/env python3
"""Read the drafted blurbs, fix them, and sign them.

Usage:
  editorial.py drafts  [--vibe handle/app-slug]      what is waiting to be read
  editorial.py show    <link-id> [--vibe ...]        one link and its draft
  editorial.py approve <link-id> --by <name> [--text "..."] [--vibe ...]
  editorial.py reject  <link-id> [--vibe ...]        clear the draft, redraft next tick

The page shows the draft, marked as a draft, because the people reading it are
the people deciding what to post. What `approve` does is drop that marker: it
records that a person went through the line and stands behind it. Passing
--text replaces the draft with your own words, which is the expected case
rather than the exception.

Approval in the sense that matters is posting to r/vibecoding, which happens
from a person's own account and not from here.

House style is vibe/EDITORIAL.md. If the drafts keep coming back wrong, that
file is the thing to change, not each blurb.
"""
import json, subprocess, sys

CLI = ["npx", "-y", "vibes-diy@latest"]


def cli(args, vibe, stdin=None):
    cmd = CLI + args + (["--vibe", vibe] if vibe else [])
    res = subprocess.run(cmd, input=stdin, text=True, capture_output=True)
    if res.returncode != 0:
        print(res.stderr.strip()[:600])
        sys.exit(1)
    return res.stdout


def docs(out):
    start = out.find("[")
    obj = out.find("{")
    if start == -1 or (obj != -1 and obj < start):
        start = obj
    if start == -1:
        return []
    parsed = json.loads(out[start:])
    return parsed if isinstance(parsed, list) else [parsed]


def links(vibe):
    return docs(cli(["db", "query", "type", "--db", "newsroom", "--key", '"link"', "--json"], vibe))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    vibe = sys.argv[sys.argv.index("--vibe") + 1] if "--vibe" in sys.argv else None
    text = sys.argv[sys.argv.index("--text") + 1] if "--text" in sys.argv else None
    by = sys.argv[sys.argv.index("--by") + 1] if "--by" in sys.argv else None

    if cmd == "drafts":
        rows = [l for l in links(vibe) if l.get("blurbDraft") and not l.get("blurb")]
        for l in rows:
            print(f"\n{l['_id']}")
            print(f"  {l.get('title')}")
            print(f"  {l.get('score')} points, {l.get('comments')} comments"
                  + (" · more talk than votes" if l.get("underseen") else ""))
            print(f"  draft: {l.get('blurbDraft')}")
        signed = sum(1 for l in links(vibe) if l.get("blurb"))
        print(f"\n{len(rows)} waiting to be read, {signed} already signed")
        return

    if cmd == "show":
        doc = [l for l in links(vibe) if l["_id"] == sys.argv[2]]
        print(json.dumps(doc[0] if doc else {}, indent=2))
        return

    if cmd in ("approve", "reject"):
        link_id = sys.argv[2]
        found = [l for l in links(vibe) if l["_id"] == link_id]
        if not found:
            print(f"no link with id {link_id}")
            sys.exit(1)
        doc = found[0]
        if cmd == "reject":
            doc.pop("blurbDraft", None)
            doc.pop("blurbDraftedAt", None)
            print(f"{link_id}: draft cleared, a new one is written on a later tick")
        else:
            if not by:
                print("--by is required: a blurb goes out over somebody's name")
                sys.exit(2)
            doc["blurb"] = text or doc.get("blurbDraft")
            doc["blurbBy"] = by
            if not doc["blurb"]:
                print("nothing to approve: no draft and no --text")
                sys.exit(1)
            print(f"{link_id}: signed by {by}")
        cli(["db", "put", "--db", "newsroom", "-"], vibe, stdin=json.dumps(doc))
        return

    print(__doc__)
    sys.exit(2)


if __name__ == "__main__":
    main()
