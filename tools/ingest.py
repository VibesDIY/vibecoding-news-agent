#!/usr/bin/env python3
"""Load raw corpus answers into the deployed generator's database.

Usage: ingest.py <rawdir> [--vibe handle/app-slug] [--rearm]

Why this exists. The generator's backend.js knows how to call the corpus API
itself, and it tries on every tick. Right now the platform refuses that call:
outbound requests from a vibe are forwarded only to hosts that would answer a
browser on the app's own page, and the corpus API replies "Disallowed CORS
origin" to any origin but its own. So the collector records the refusal and
this script carries the answers in by hand, which is the same data through the
same door the backend would have used.

Two ways out of the hand step, both outside this repo: the corpus can serve
Access-Control-Allow-Origin, or its host can join the platform's allowed list.
Either one and backend.js starts collecting on its own with no code change.

Input is whatever tools/vg.py wrote: one JSON file per query, holding the
request and the cited answer.
"""
import json, os, subprocess, sys

CLI = ["npx", "-y", "vibes-diy@latest"]


def source_doc(payload):
    """Shape one vg.py file into the document backend.js expects to extract."""
    name = payload["name"]
    status = payload.get("status") or {}
    answer = status.get("answer")
    if not answer:
        return None
    asked = status.get("created_at") or ""
    day = asked[:10] or "undated"
    return {
        "_id": f"source:{name}:{day}",
        "type": "source",
        # "new" is the keyed read the extractor uses. Loading a file twice
        # re-arms extraction for that source, which is the intended way to
        # re-run a pass after changing the prompt.
        "status": "new",
        "name": name,
        "question": payload.get("question", ""),
        "askedAt": asked,
        "answeredAt": status.get("completed_at") or asked,
        "answer": answer,
        # The measured per-entity table. This is the only input the report is
        # allowed to rank from, so it travels with the answer, not apart.
        "entitySentiment": status.get("entity_sentiment") or {},
        "urlMappings": status.get("url_mappings") or {},
        # The cited posts with their scores and comment counts. These ride the
        # ASK response rather than the answer, which is why they are read from
        # `analyze` and not from `status`.
        "examples": (payload.get("analyze") or {}).get("representative_examples") or [],
        "requestId": (payload.get("analyze") or {}).get("request_id"),
        "loadedBy": "tools/ingest.py",
    }


def existing_status(doc_id, vibe):
    """What the app already thinks of this source, or None if it is new."""
    cmd = CLI + ["db", "get", doc_id, "--db", "newsroom", "--json"]
    if vibe:
        cmd += ["--vibe", vibe]
    res = subprocess.run(cmd, text=True, capture_output=True)
    if res.returncode != 0:
        return None
    # The CLI pretty-prints, so the document spans many lines. Parsing line by
    # line found no JSON and quietly answered "this source is new", which
    # re-ran the model over two sources that were already done.
    start = res.stdout.find("{")
    if start == -1:
        return None
    try:
        return json.loads(res.stdout[start:]).get("status")
    except ValueError:
        return None


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    rawdir = sys.argv[1]
    vibe = None
    if "--vibe" in sys.argv:
        vibe = sys.argv[sys.argv.index("--vibe") + 1]
    # Loading a file again should not silently re-run the model over a source
    # the app already processed. It carries whatever is new in the file and
    # leaves the source where it was in the pipeline, unless you say otherwise.
    rearm = "--rearm" in sys.argv

    for fname in sorted(os.listdir(rawdir)):
        if not fname.endswith(".json"):
            continue
        payload = json.load(open(os.path.join(rawdir, fname)))
        doc = source_doc(payload)
        if not doc:
            print(f"[ingest] {fname}: no answer in file, skipping")
            continue
        if not rearm:
            was = existing_status(doc["_id"], vibe)
            if was:
                doc["status"] = was
        cmd = CLI + ["db", "put", "--db", "newsroom"]
        if vibe:
            cmd += ["--vibe", vibe]
        cmd += ["-"]
        res = subprocess.run(cmd, input=json.dumps(doc), text=True, capture_output=True)
        ok = res.returncode == 0
        print(f"[ingest] {doc['_id']}: {'written' if ok else 'FAILED'}")
        if not ok:
            print(res.stderr.strip()[:400])
            sys.exit(1)


if __name__ == "__main__":
    main()
