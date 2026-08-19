#!/usr/bin/env python3
"""Query the vibes.guru semantic index of r/vibecoding and save raw JSON.

Usage: vg.py <outdir> <queryfile.json>
queryfile.json: [{"name": "...", "question": "...", "lens": "culture"|null}, ...]

Respects the documented rate limits: serial, 120s gap between queries,
backs off 3+ min on 429/503 and probes readiness before resuming.
"""
import json, os, ssl, sys, time, urllib.request, urllib.error

BASE = "https://web-production-fe6e.up.railway.app"
CA = "/root/.ccr/ca-bundle.crt"
CTX = ssl.create_default_context(cafile=CA if os.path.exists(CA) else None)
GAP = 120

def post(path, payload, timeout=120):
    req = urllib.request.Request(BASE + path, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return json.loads(r.read())

def get(path, timeout=60):
    with urllib.request.urlopen(BASE + path, timeout=timeout, context=CTX) as r:
        return json.loads(r.read())

def analyze(question, lens, max_results=250, include_comments=True):
    return post("/analyze", {"question": question, "max_results": max_results,
                             "include_comments": include_comments,
                             "analysis_type": "comprehensive", "lens": lens})

def wait_ready():
    """Tiny probe loop; returns once the pipeline accepts a request."""
    while True:
        try:
            analyze("ping", None, max_results=5, include_comments=False)
            print("[vg] pipeline ready", flush=True)
            return
        except Exception as e:
            print(f"[vg] not ready ({e}); sleeping 300s", flush=True)
            time.sleep(300)

def run(name, question, lens, outdir):
    for attempt in range(3):
        try:
            res = analyze(question, lens)
            break
        except urllib.error.HTTPError as e:
            print(f"[vg] {name}: HTTP {e.code} attempt {attempt+1}", flush=True)
            if attempt == 2:
                wait_ready()
                res = analyze(question, lens)
            else:
                time.sleep(200)
        except Exception as e:
            print(f"[vg] {name}: {e} attempt {attempt+1}", flush=True)
            if attempt == 2:
                raise
            time.sleep(200)
    rid = res.get("request_id")
    print(f"[vg] {name}: request_id={rid}", flush=True)
    answer = None
    if rid:
        for _ in range(30):
            time.sleep(10)
            try:
                st = get(f"/analyze/{rid}/status")
            except Exception as e:
                print(f"[vg] {name}: status err {e}", flush=True)
                continue
            if not st.get("analysis_pending") and st.get("answer"):
                answer = st
                break
    out = {"name": name, "question": question, "lens": lens,
           "analyze": res, "status": answer}
    path = os.path.join(outdir, f"{name}.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"[vg] {name}: saved {path} (answer={'yes' if answer else 'NO'})", flush=True)

def main():
    outdir, qfile = sys.argv[1], sys.argv[2]
    os.makedirs(outdir, exist_ok=True)
    queries = json.load(open(qfile))
    for i, q in enumerate(queries):
        if os.path.exists(os.path.join(outdir, f"{q['name']}.json")):
            print(f"[vg] {q['name']}: already done, skipping", flush=True)
            continue
        run(q["name"], q["question"], q.get("lens"), outdir)
        if i != len(queries) - 1:
            print(f"[vg] sleeping {GAP}s", flush=True)
            time.sleep(GAP)
    print("[vg] all done", flush=True)

if __name__ == "__main__":
    main()
