// The generator. Everything the agent decides is in this file, and the
// questions it asks are data you can change in a pull request.
//
// Three jobs, all on one tick and each on its own clock:
//   1. collect   ask the corpus a question, poll for the cited answer
//   2. extract   turn one raw answer into structured findings (ctx.callAI)
//   3. measure   pull the corpus's own per-entity counts out of that answer
//   4. assemble  gather confirmed entities and leads into a draft report
//
// What it deliberately does NOT do: write the published prose. The report doc
// it produces holds analysis, counts and permalinks. Prose is a separate pass
// with a stronger model and then a person edits it. A report written by the
// same cheap loop that computed it is worth nothing to a reader who wants to
// check the method.

export const config = { scheduled: { interval: "15m" } };

// ---------------------------------------------------------------- constants

const CORPUS = "https://web-production-fe6e.up.railway.app";

// The corpus rate limits at 10 requests an hour and reports that limit at
// GET /stats. Exceeding it has taken the pipeline down for hours while the
// health endpoint kept returning green, so the generator budgets well under
// it and leaves room for a person running tools/vg.py by hand.
const CORPUS_CALLS_PER_HOUR = 4;

// A subreddit does not change every fifteen minutes. The tick is cheap; the
// expensive clocks are these.
const COLLECT_EVERY_MS = 6 * 60 * 60 * 1000; // ask one new question, at most, every 6h
const EXTRACT_PER_TICK = 1; // one ctx.callAI pass per tick, never a burst
// A question that never comes back has to be abandoned, or the collector
// spends a poll on it every tick until someone notices. Answers land in
// minutes; two hours means the request is gone.
const PENDING_GIVEUP_MS = 2 * 60 * 60 * 1000;

// What makes a link worth putting in front of people.
//
// The obvious half is the score: a thread the subreddit already voted up. The
// half worth building for is the other one, a thread that clearly earned a
// conversation and never got the votes. "Can vibe-coded apps actually survive
// production?" sat at 2 points with 40 comments. Forty people had something to
// say and almost nobody pressed the arrow, which means most of the subreddit
// never saw it. That is the best thing a round-up can carry, because everyone
// else's round-up carries the same top posts.
//
// So: a link is UNDERSEEN when it drew real discussion and the votes did not
// follow. Both numbers travel with it so a reader can disagree with the rule.
const UNDERSEEN_MIN_COMMENTS = 8;
const UNDERSEEN_COMMENT_RATIO = 4;
// And a ceiling on the score, which the first version was missing. A thread at
// 19 points with 94 comments passes the ratio and is in no way overlooked: it
// is a well-received thread that also got talked about. Flagging it spends the
// badge on something everyone already saw, which is the one thing the badge is
// supposed to be worth. Overlooked means the votes stayed near zero.
const UNDERSEEN_MAX_SCORE = 5;

// The blurb pass. One link per tick, because this is the call that is supposed
// to be worth paying for: the analysis loop can be cheap, the writing cannot.
// Set EDITORIAL_MODEL to the best model available to the account running this.
// "openrouter/auto" is a safe default and not the right answer for prose.
const EDITORIAL_MODEL = "openrouter/auto";
const BLURB_PER_TICK = 1;

const DB_CORPUS = "corpus";
const DB_FINDINGS = "findings";

const STATE_ID = "0-collector-state";
const BUDGET_ID = "0-corpus-budget";
const QUESTIONS_ID = "0-questions";
const STATUS_ID = "0-refresh-status";
const TICK_REPORT_ID = "0-tick-report";

// The seed question set. Edit this list (or the 0-questions doc it seeds) to
// change what the agent asks. Nothing else in the pipeline is question-aware.
const SEED_QUESTIONS = [
  {
    name: "post-ship-failures",
    question:
      "What problems do people report after deploying an app they vibe coded? What breaks once real users are on it?",
    lens: null,
  },
  {
    name: "cost-surprises",
    question: "What do people say about unexpected costs, token spend or API bills from AI coding tools?",
    lens: null,
  },
  {
    name: "abandonment",
    question: "Why do people say they abandoned, rewrote or gave up on a vibe coded project?",
    lens: null,
  },
];

// Isolate-memory copy of the state doc. A missing state doc means "use this
// copy", never "nothing has been done". That second reading is what turns a
// collector into a rewrite loop.
let memState = null;

// ------------------------------------------------------------------ helpers

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function isCitationRef(value) {
  return /^(comment|post)[_\s-]?[a-z0-9]{5,}$/i.test(String(value || "").trim());
}

function dayKey(iso) {
  return String(iso).slice(0, 10);
}

function hourKey(iso) {
  return String(iso).slice(0, 13);
}

// True only when every field we track already matches what is stored, so a
// tick that changes nothing writes nothing. Byte-identical re-puts still cost
// a revision, and revisions are not collected.
function unchanged(existing, next) {
  if (!existing) return false;
  return Object.keys(next).every((k) => {
    const a = existing[k];
    const b = next[k];
    if (a && b && typeof a === "object") return JSON.stringify(a) === JSON.stringify(b);
    return a === b;
  });
}

async function putIfChanged(ctx, doc, db) {
  const existing = await ctx.db.get(doc._id, { db });
  if (unchanged(existing, doc)) return false;
  await ctx.db.put(doc, { db });
  return true;
}

// A keyed query answers from an index that can lag its own writes. Twice in
// one hour the extractor was handed a source it had already processed and
// stamped, because the stamp had not reached the index the query reads. Work
// is idempotent by document id so nothing was corrupted, but a re-extraction
// costs a model call, which is the expensive thing this loop does.
//
// So a candidate from a query is a CANDIDATE. The point read by id is the
// authoritative answer, and it is cheap. Ask it before spending anything.
async function stillWaiting(ctx, db, id, status) {
  const fresh = await ctx.db.get(id, { db });
  return fresh && fresh.status === status ? fresh : null;
}

// Take up to `want` documents matching a filter.
//
// The subtlety that cost a couple of ticks here: `limit` clamps the RAW page
// before the filter runs, so asking for one matching document actually asks
// for one document, which is then filtered and is usually nothing. The
// database's first document by id is a state doc that matches no content
// filter, so a limit of one returned an empty page every time while an
// unfiltered count in the same tick reported seven documents and three
// matches. Pages are walked on `next` and the cap is applied here, where it
// means what it says.
async function readSome(ctx, db, field, key, want) {
  const out = [];
  let after;
  do {
    const page = await ctx.db.query({ db, field, key, limit: 200, after });
    for (const doc of page) {
      out.push(doc);
      if (out.length >= want) return out;
    }
    after = page.next;
  } while (after);
  return out;
}

async function loadState(ctx) {
  const stored = await ctx.db.get(STATE_ID, { db: DB_FINDINGS });
  const state = stored || memState || { _id: STATE_ID, type: "state" };
  memState = state;
  return state;
}

async function saveState(ctx, state) {
  memState = state;
  await ctx.db.put({ ...state, _id: STATE_ID, type: "state" }, { db: DB_FINDINGS });
}

async function questions(ctx) {
  const doc = await ctx.db.get(QUESTIONS_ID, { db: DB_CORPUS });
  if (doc && Array.isArray(doc.questions) && doc.questions.length) return doc.questions;
  await putIfChanged(ctx, { _id: QUESTIONS_ID, type: "config", questions: SEED_QUESTIONS }, DB_CORPUS);
  return SEED_QUESTIONS;
}

// The corpus budget, kept as one doc read by id. Nothing is derived from a
// scan, so it stays correct however large the database gets.
async function spendCorpusCall(ctx, now) {
  const key = hourKey(now);
  const doc = (await ctx.db.get(BUDGET_ID, { db: DB_CORPUS })) || {};
  const used = doc.hour === key ? doc.used || 0 : 0;
  if (used >= CORPUS_CALLS_PER_HOUR) return false;
  await ctx.db.put({ _id: BUDGET_ID, type: "budget", hour: key, used: used + 1 }, { db: DB_CORPUS });
  return true;
}

async function noteStatus(ctx, state, message) {
  await putIfChanged(ctx, { _id: STATUS_ID, type: "status", state, message }, DB_CORPUS);
}

// Every outbound call goes through ctx.fetch, and a denied one comes back as a
// 403 carrying vibesEgressDenied rather than an exception.
async function corpusFetch(ctx, path, init) {
  const res = await ctx.fetch(CORPUS + path, init);
  if (res.status === 403) {
    const denied = await res
      .clone()
      .json()
      .catch(() => null);
    if (denied && denied.vibesEgressDenied === true) {
      await noteStatus(
        ctx,
        "egress-denied",
        "The platform will not call the corpus API from this vibe (gate: " +
          (denied.gate || "unknown") +
          "). Raw answers have to be loaded with tools/ingest.py until the corpus serves CORS or the host is on the platform's allowed list.",
      );
      return null;
    }
  }
  return res;
}

// -------------------------------------------------------------- 1. collect
//
// Two phases across two ticks on purpose: ctx.fetch gives a handler 15s, and
// the corpus takes minutes to answer. So one tick posts the question and
// writes down the request id, and a later tick polls it. Nothing blocks.

async function collect(ctx, state, now) {
  const pending = state.pending;

  if (pending) {
    if (Date.parse(now) - Date.parse(pending.askedAt) > PENDING_GIVEUP_MS) {
      ctx.log("warn", "abandoning a request that never answered", { name: pending.name, requestId: pending.requestId });
      return { ...state, pending: null };
    }
    if (!(await spendCorpusCall(ctx, now))) return state;
    const res = await corpusFetch(ctx, "/analyze/" + pending.requestId + "/status");
    if (!res) return state; // egress denied; status doc already says so
    if (!res.ok) {
      ctx.log("warn", "corpus status not ok", { requestId: pending.requestId, status: res.status });
      return state;
    }
    const body = await res.json().catch(() => null);
    if (!body || body.analysis_pending || !body.answer) {
      ctx.log("collect still pending", { requestId: pending.requestId });
      return state;
    }
    await putIfChanged(
      ctx,
      {
        _id: "source:" + pending.name + ":" + dayKey(pending.askedAt),
        type: "source",
        status: "new",
        name: pending.name,
        question: pending.question,
        askedAt: pending.askedAt,
        answeredAt: now,
        answer: body.answer,
        // The measured table the ranking is allowed to use, and the citation
        // map behind the answer's inline references.
        entitySentiment: body.entity_sentiment || {},
        urlMappings: body.url_mappings || {},
        // The cited posts with their scores and comment counts. These arrive
        // on the ASK, not on the answer poll, so they are carried across the
        // two ticks on the pending record.
        examples: pending.examples || [],
        requestId: pending.requestId,
      },
      DB_CORPUS,
    );
    await noteStatus(ctx, "ok", "Last answer collected " + now);
    ctx.log("collected", { name: pending.name });
    return { ...state, pending: null, lastCollectAt: now };
  }

  const since = state.lastCollectAt ? Date.parse(now) - Date.parse(state.lastCollectAt) : Infinity;
  if (since < COLLECT_EVERY_MS) return state;

  const list = await questions(ctx);
  const askedToday = state.askedToday && state.askedToday.day === dayKey(now) ? state.askedToday.names : [];
  const next = list.find((q) => !askedToday.includes(q.name));
  if (!next) return state;

  if (!(await spendCorpusCall(ctx, now))) return state;
  const res = await corpusFetch(ctx, "/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: next.question,
      max_results: 250,
      include_comments: true,
      analysis_type: "comprehensive",
      lens: next.lens || null,
    }),
  });
  if (!res) return state;
  if (!res.ok) {
    ctx.log("warn", "corpus analyze rejected", { name: next.name, status: res.status });
    return state;
  }
  const body = await res.json().catch(() => null);
  if (!body || !body.request_id) return state;

  ctx.log("asked", { name: next.name, requestId: body.request_id });
  return {
    ...state,
    pending: {
      requestId: body.request_id,
      name: next.name,
      question: next.question,
      askedAt: now,
      examples: Array.isArray(body.representative_examples) ? body.representative_examples.slice(0, 20) : [],
    },
    askedToday: { day: dayKey(now), names: askedToday.concat(next.name) },
  };
}

// -------------------------------------------------------------- 2. extract
//
// One raw answer becomes structured findings. The read is keyed on status, so
// it returns exactly the unprocessed set rather than a page of the whole
// database. That is the difference between a collector that stays correct and
// one that goes blind at 2000 docs.

const FINDING_SCHEMA = {
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity: { type: "string" },
          claim: { type: "string" },
          sentiment: { type: "string" },
          mentions: { type: "number" },
          permalinks: { type: "array", items: { type: "string" } },
        },
        required: ["entity", "claim"],
      },
    },
  },
  required: ["findings"],
};

const EXTRACT_PROMPT = [
  "Read this synthesis of r/vibecoding discussion and pull out the separate claims it makes.",
  "",
  "Rules:",
  "- One finding per claim. `entity` is the tool, product or person the claim is about, or a short topic phrase of two to four words when the claim names none.",
  "- `entity` is NEVER a citation reference. Strings like comment_ok3ab12 or post_1tqyz3c identify where a claim came from, not what it is about. Those belong in permalinks and nowhere else.",
  "- `claim` states what the community said, in one sentence, without adjectives you cannot source.",
  "- `permalinks` carries only reddit.com URLs that appear in the text. Never invent one.",
  "- `mentions` is a count only if the text states one. Leave it out otherwise.",
  "- Do not rank anything and do not add a conclusion of your own.",
  "",
  "QUESTION: ",
].join("\n");

async function extract(ctx, state, now) {
  const candidates = await readSome(ctx, DB_CORPUS, "status", "new", EXTRACT_PER_TICK);
  const sources = [];
  for (const c of candidates) {
    const fresh = await stillWaiting(ctx, DB_CORPUS, c._id, "new");
    if (fresh) sources.push(fresh);
    else ctx.log("skipped a source the index still lists as unprocessed", { source: c._id });
  }
  if (!sources.length) return state;

  for (const source of sources) {
    let parsed = null;
    try {
      const raw = await ctx.callAI(
        EXTRACT_PROMPT + source.question + "\n\nSYNTHESIS:\n" + String(source.answer).slice(0, 48000),
        { schema: FINDING_SCHEMA, max_tokens: 2000 },
      );
      parsed = JSON.parse(raw);
    } catch (err) {
      ctx.log("error", "extract failed", { source: source._id, message: String(err && err.message) });
      await putIfChanged(ctx, { ...source, status: "error", extractError: String(err && err.message) }, DB_CORPUS);
      continue;
    }

    const findings = Array.isArray(parsed && parsed.findings) ? parsed.findings.slice(0, 40) : [];
    let written = 0;
    for (const f of findings) {
      // The model has been observed answering with the citation reference it
      // was reading (comment_ok3ab12) instead of the subject of the claim. A
      // finding filed under the id of its own footnote is unreadable, and the
      // page would print it as a heading, so it is caught here as well as
      // forbidden in the prompt.
      const entity = isCitationRef(f.entity) ? source.name : String(f.entity || "").slice(0, 120);
      const id = "finding:" + source.name + ":" + slug(entity) + ":" + slug(String(f.claim).slice(0, 40));
      const doc = {
        _id: id,
        type: "finding",
        entity,
        claim: String(f.claim || "").slice(0, 600),
        sentiment: f.sentiment ? String(f.sentiment).slice(0, 40) : null,
        mentions: typeof f.mentions === "number" ? f.mentions : null,
        permalinks: (Array.isArray(f.permalinks) ? f.permalinks : [])
          .filter((u) => typeof u === "string" && u.indexOf("reddit.com") !== -1)
          .slice(0, 6),
        // Where this came from decides what may be done with it. A finding
        // pulled out of a broad synthesis is a lead. Only a query that named
        // the entity and came back with a count can carry a ranking, because
        // the first pass of the research this repo grew out of ranked a
        // YouTube channel first on impression, and querying that channel by
        // name found 11 mentions at +0.12 sentiment. Impressions are not
        // evidence, so the pipeline keeps the distinction in the data.
        evidenceClass: "synthesis",
        sourceId: source._id,
        sourceName: source.name,
        extractedAt: now,
        verified: false,
      };
      if (await putIfChanged(ctx, doc, DB_FINDINGS)) written++;
    }

    await putIfChanged(ctx, { ...source, status: "measured", extractedAt: now }, DB_CORPUS);
    ctx.log("extracted", { source: source._id, findings: findings.length, written });
  }

  return { ...state, lastExtractAt: now };
}

// -------------------------------------------------------------- 3. measure
//
// The corpus returns a per-entity table alongside its prose: how many times
// each entity is mentioned and the sentiment of those mentions. That table is
// the only thing here that can carry a ranking, because a count reports what
// is there and a synthesis reports what it noticed. The research this repo
// grew out of ranked a YouTube channel first because a synthesis kept
// bringing him up, and querying him by name found 11 mentions at +0.12
// sentiment, which is neutral.
//
// One thing about that table decides how it may be described, and it was not
// obvious. It is INDEX-WIDE, not an answer to the question asked. Three
// different questions on 2026-08-19 came back with byte-identical tables:
// the same fifteen names and the same counts. So these numbers say how much
// the subreddit talks about each tool overall. They say nothing about the
// question the answer above them was written for, and every surface that
// prints them has to say so, or the report claims something it did not
// measure. The scope travels on the document for that reason.

async function measure(ctx, state, now) {
  const candidates = await readSome(ctx, DB_CORPUS, "status", "measured", 4);
  const sources = [];
  for (const c of candidates) {
    const fresh = await stillWaiting(ctx, DB_CORPUS, c._id, "measured");
    if (fresh) sources.push(fresh);
  }
  if (!sources.length) return state;

  for (const source of sources) {
    const table = source.entitySentiment || {};
    let written = 0;
    for (const name of Object.keys(table).slice(0, 60)) {
      const row = table[name] || {};
      if (typeof row.mention_count !== "number") continue;
      const id = "entity:" + slug(name);
      const existing = await ctx.db.get(id, { db: DB_FINDINGS });
      const doc = {
        _id: id,
        type: "entity",
        entity: name,
        mentions: row.mention_count,
        sentiment: typeof row.avg_sentiment === "number" ? row.avg_sentiment : null,
        positivePct: typeof row.positive_pct === "number" ? row.positive_pct : null,
        negativePct: typeof row.negative_pct === "number" ? row.negative_pct : null,
        evidenceClass: "measured",
        // Index-wide. See the note above this function before writing any
        // copy that puts these numbers next to a question.
        scope: "whole-index",
        sourceName: source.name,
        measuredAt: now,
        // Verification is a separate pass and it is not the generator's to
        // grant. The flag is carried forward from whatever a verification doc
        // last said, so a re-measure never quietly promotes an entity.
        verified: existing ? existing.verified === true : false,
        verifiedNote: existing ? existing.verifiedNote || null : null,
      };
      if (await putIfChanged(ctx, doc, DB_FINDINGS)) written++;
    }
    await putIfChanged(ctx, { ...source, status: "extracted" }, DB_CORPUS);
    ctx.log("measured", { source: source._id, entities: Object.keys(table).length, written });
  }
  return { ...state, lastMeasureAt: now };
}

// --------------------------------------------------------------- 3b. links
//
// The round-up itself. Each cited post becomes one link document carrying the
// two numbers the ordering rests on, so nothing downstream has to re-derive
// them and anyone can check the call.

// A cited post's `url` is what the post POINTS AT, not the post. A self post
// points at its own permalink, a link post points at imgur, and a post pulled
// in from another subreddit arrives as a bare path. Only the first of those is
// something to link a reader to, so the discussion permalink is rebuilt from
// the one part every form carries: /r/<sub>/comments/<id>. Anything with no id
// in it has no thread to point at and is counted as skipped rather than
// quietly dropped.
function permalinkOf(e) {
  const m = /\/r\/([A-Za-z0-9_]+)\/comments\/([a-z0-9]+)/.exec(String((e && e.url) || ""));
  if (!m) return null;
  return "https://reddit.com/r/" + m[1] + "/comments/" + m[2] + "/";
}

// The post's own words. The corpus hands back a blob that starts with the
// title and then the body, both labelled, so the labels come off and what is
// left is the opening of the post. It is the cheapest way to make one link
// distinguishable from the next, and it costs nothing: this text was already
// sitting in the document the answer arrived in.
function excerptOf(e) {
  const raw = String((e && e.content) || "");
  const body = raw.indexOf("Content:") >= 0 ? raw.slice(raw.indexOf("Content:") + 8) : raw;
  return body.replace(/\s+/g, " ").trim().slice(0, 260);
}

function linkRow(e, url, sourceName, now) {
  const score = typeof e.score === "number" ? e.score : 0;
  const comments = typeof e.num_comments === "number" ? e.num_comments : 0;
  return {
    _id: "link:" + slug(url.replace(/^https?:\/\/(www\.)?reddit\.com\/r\//, "").slice(0, 60)),
    type: "link",
    url,
    title: String(e.title || "").slice(0, 200),
    excerpt: excerptOf(e),
    // Who wrote it and where it was posted. The where matters more than it
    // looks: the corpus cites r/nocode and r/webdev threads too, and a reader
    // deserves to know when a link leaves the subreddit it was collected for.
    author: String(e.author || "").slice(0, 60),
    subreddit: String(e.subreddit || "").slice(0, 40),
    score,
    comments,
    relevance: typeof e.relevance_score === "number" ? Math.round(e.relevance_score * 100) / 100 : null,
    // Discussion the votes did not follow. Kept as data rather than a label
    // so a reader who dislikes the rule can apply their own.
    underseen:
      comments >= UNDERSEEN_MIN_COMMENTS &&
      comments >= UNDERSEEN_COMMENT_RATIO * Math.max(score, 1) &&
      score <= UNDERSEEN_MAX_SCORE,
    sourceName,
    harvestedAt: now,
  };
}

async function harvest(ctx, state, now) {
  const candidates = await readSome(ctx, DB_CORPUS, "status", "extracted", 4);
  let written = 0;
  for (const c of candidates) {
    const source = await stillWaiting(ctx, DB_CORPUS, c._id, "extracted");
    if (!source) continue;
    let skipped = 0;
    for (const e of (source.examples || []).slice(0, 20)) {
      const url = permalinkOf(e);
      if (!url) {
        skipped++;
        continue;
      }
      if (await putIfChanged(ctx, linkRow(e, url, source.name, now), DB_FINDINGS)) written++;
    }
    await putIfChanged(ctx, { ...source, status: "harvested", linksSkipped: skipped }, DB_CORPUS);
    ctx.log("harvested", { source: source._id, cited: (source.examples || []).length, written, skipped });
  }
  return written ? { ...state, lastHarvestAt: now } : state;
}

// The order the round-up goes out in. Not by score, and not by the underseen
// rule either: alternating between them. A list of only top posts is one
// everybody has already read, and a list of only overlooked ones reads like a
// contrarian pose. The mix is the point, so the interleave is the algorithm.
function roundup(links) {
  const seen = links.filter((l) => !l.underseen).sort((a, b) => b.score - a.score);
  const missed = links.filter((l) => l.underseen).sort((a, b) => b.comments - a.comments);
  const out = [];
  while (seen.length || missed.length) {
    if (missed.length) out.push(missed.shift());
    if (seen.length) out.push(seen.shift());
  }
  return out;
}

// ------------------------------------------------------------- 3c. the blurb
//
// The only part of this app that writes rather than counts, and the only part
// a person has to sign before anyone sees it.
//
// House style lives in EDITORIAL.md next to this file, and the prompt below
// quotes it rather than paraphrasing, so editing the rules means editing one
// place. What lands here is a DRAFT. The page never renders a draft. A person
// promotes one with tools/editorial.py, and can rewrite it on the way through.
//
// Why the gate is not ceremony: this audience spots machine prose and mocks it
// above the fold, and the corpus measures them doing it. A page of unread
// machine blurbs would cost more credibility than the round-up earns.

const BLURB_RULES = [
  "You are drafting one blurb for a link round-up, in the style of Boing Boing when it was good.",
  "",
  "A person found this thread, points at the one detail that made them stop, and has an opinion about it.",
  "",
  "Rules:",
  "- Lead with the specific detail, never the topic. The reader can already see the topic in the title.",
  "- Have a view: delighted, annoyed, unconvinced, quietly vindicated. A blurb with no attitude is a summary wearing a hat.",
  "- Two or three sentences. Forty words is plenty.",
  "- Quote the poster when they said it better than you would, which is most of the time.",
  "- If the numbers are the story, say so in a clause. A thread at 2 points with 40 replies means the subreddit argued about something it never voted on.",
  "- No summary verbs. Nothing explores, delves into, highlights or sheds light on. If your sentence would survive being pasted under a different link, delete it.",
  "- No em-dashes. No rule-of-three cadence. This audience reads both as a machine's fingerprints and says so in the comments.",
  "- Invent nothing. Everything comes from the post, its numbers, or the question that surfaced it.",
  "",
  "Answer with the blurb and nothing else. No preamble, no quotation marks around the whole thing.",
  "",
].join("\n");

async function dress(ctx, state, now) {
  const links = await readAll(ctx, DB_FINDINGS, "link");
  const waiting = links.filter((l) => !l.blurbDraft && !l.blurb).slice(0, BLURB_PER_TICK);
  if (!waiting.length) return state;

  for (const l of waiting) {
    let draft;
    try {
      draft = String(
        await ctx.callAI(
          BLURB_RULES +
            "THREAD: " +
            l.title +
            "\nPosted in r/" +
            (l.subreddit || "vibecoding") +
            " by u/" +
            (l.author || "someone") +
            "\nIt has " +
            l.score +
            " points and " +
            l.comments +
            " comments." +
            (l.underseen ? " The discussion ran far ahead of the votes." : "") +
            "\nIt opens: " +
            (l.excerpt || "(no text)"),
          { model: EDITORIAL_MODEL, max_tokens: 200 },
        ),
      ).trim();
    } catch (err) {
      ctx.log("error", "blurb draft failed", { link: l._id, message: String(err && err.message) });
      continue;
    }
    if (!draft) continue;
    await putIfChanged(ctx, { ...l, blurbDraft: draft.slice(0, 500), blurbDraftedAt: now }, DB_FINDINGS);
    ctx.log("drafted a blurb", { link: l._id, words: draft.split(/\s+/).length });
  }
  return { ...state, lastBlurbAt: now };
}

// ------------------------------------------------------------- 4. assemble
//
// The draft report. It carries findings, the counts behind them and the
// permalinks, and it says out loud what it is not: written prose. Anything a
// verification pass has not confirmed is reported as a lead and counted, never
// silently dropped, because the count is how a reader judges the rest.

// Assembly runs every tick and writes only when the content moved. A clock
// would have been the obvious guard, and it would have been wrong: the first
// tick to see one source would have written a report and then sat on it for a
// day while the other answers landed. What makes writing safe is that the
// stored report is compared field by field with the one just built, and a
// report that says the same thing is not written again. Only the timestamp
// would have differed, so the timestamp is set after the comparison, never
// before it.
async function assemble(ctx, state, now) {
  const entities = await readAll(ctx, DB_FINDINGS, "entity");
  const leads = await readAll(ctx, DB_FINDINGS, "finding");
  const links = roundup(await readAll(ctx, DB_FINDINGS, "link"));
  // Cited posts that had no thread to link to (an image post, usually). Counted
  // and printed rather than dropped, so the round-up's size is honest about
  // what the corpus actually handed over.
  const sources = await readAll(ctx, DB_CORPUS, "source");
  // What each link is doing here. An earlier version tried to attach the
  // claims the corpus made, joined on the thread id, and it matched nothing:
  // the synthesis quotes comments from threads that are not the ones it holds
  // up as examples. Two different populations of link, and pretending
  // otherwise produced an empty field on every entry. The question that
  // surfaced a thread is always known, so that is what each link carries.
  const questionOf = {};
  for (const s2 of sources) questionOf[s2.name] = s2.question;
  const noThread = sources.reduce((n, s2) => n + (s2.linksSkipped || 0), 0);
  if (!entities.length && !leads.length && !links.length) return state;

  // Measured and confirmed is the only thing that gets ranked. Measured but
  // unconfirmed is counted and named as such, because a reader deciding how
  // much of this to believe needs the size of the unchecked pile. Both are
  // index-wide counts and the report says so in the document itself, since a
  // number that travels without its scope will be read as answering whatever
  // question it is printed beneath.
  const ranked = entities.filter((e) => e.verified === true).sort((a, b) => b.mentions - a.mentions);
  const unverified = entities.filter((e) => e.verified !== true).sort((a, b) => b.mentions - a.mentions);

  const day = dayKey(now);
  const body = {
    _id: "report:" + day,
    type: "report",
    day,
    // The state of this document, stated in the document, so no reader has to
    // infer it and no later step can quietly skip one.
    status: "analysis-draft",
    prose: null,
    proseNote:
      "This is analysis, not a post. The published write-up is a separate pass with a stronger model, and a person edits it before it goes anywhere.",
    countsNote:
      "Mention counts are index-wide. They measure how much r/vibecoding discusses each tool overall, not how it came up in the questions behind this report.",
    counts: {
      links: links.length,
      underseen: links.filter((l) => l.underseen).length,
      citedWithNoThread: noThread,
      blurbs: links.filter((l) => l.blurb).length,
      blurbsAwaitingAPerson: links.filter((l) => l.blurbDraft && !l.blurb).length,
      entities: entities.length,
      ranked: ranked.length,
      unverified: unverified.length,
      leads: leads.length,
      sources: new Set(leads.concat(entities).map((f) => f.sourceName)).size,
    },
    // The round-up is the output. Everything under it is the working the
    // round-up was chosen from.
    roundup: links.slice(0, 30).map((l) => ({
      url: l.url,
      title: l.title,
      excerpt: l.excerpt || null,
      author: l.author || null,
      subreddit: l.subreddit || null,
      surfacedBy: questionOf[l.sourceName] || null,
      // Approved prose only. A draft nobody has read is not published.
      blurb: l.blurb || null,
      score: l.score,
      comments: l.comments,
      underseen: l.underseen,
    })),
    ranked: ranked.slice(0, 25).map(entityRow),
    unverified: unverified.slice(0, 25).map(entityRow),
    leads: leads.slice(0, 60).map((f) => ({
      entity: f.entity,
      claim: f.claim,
      sentiment: f.sentiment,
      permalinks: f.permalinks,
      sourceName: f.sourceName,
    })),
  };

  const existing = await ctx.db.get(body._id, { db: DB_FINDINGS });
  if (unchanged(existing, body)) return state;

  await ctx.db.put({ ...body, generatedAt: now }, { db: DB_FINDINGS });
  ctx.log("assembled", { day, links: links.length, entities: entities.length, leads: leads.length });
  return { ...state, lastReportAt: now };
}

function entityRow(e) {
  return {
    entity: e.entity,
    mentions: e.mentions,
    sentiment: e.sentiment,
    positivePct: e.positivePct,
    negativePct: e.negativePct,
    verifiedNote: e.verifiedNote || null,
  };
}

// Paginate on next, never on emptiness. next is computed from the raw page
// before filtering, so a narrow filter can hand back an empty page with
// matches still ahead of it.
async function readAll(ctx, db, type) {
  const out = [];
  let after;
  do {
    const page = await ctx.db.query({ db, field: "type", key: type, limit: 500, after });
    for (const doc of page) out.push(doc);
    after = page.next;
  } while (after);
  return out;
}

// ---------------------------------------------------------------- the tick

export async function scheduled(event, ctx) {
  const now = event.scheduledTime || new Date().toISOString();
  let state = await loadState(ctx);

  // What the tick did, written where a person can read it.
  //
  // This document is a WORKAROUND and should not be copied into the next
  // scheduled app. `ctx.log` above is the right lane and the only one a vibe
  // backend has, since console output is forwarded nowhere. It is duplicated
  // here because `vibes-diy app logs` returned nothing for any vibe on this
  // account while this was being built (vibes.diy#4938), and a log you cannot
  // read back is not diagnostics. Delete this and its two counts when that is
  // fixed. It writes only when the outcome changes, so a steady state writes
  // nothing.
  const steps = {};
  const run = async (name, fn) => {
    try {
      const before = JSON.stringify(state);
      state = await fn();
      steps[name] = JSON.stringify(state) === before ? "no change" : "advanced";
    } catch (err) {
      steps[name] = "failed: " + String((err && err.message) || err).slice(0, 200);
      ctx.log("error", name + " threw", { message: String(err && err.message) });
    }
  };

  // Two counts, same workaround, same deletion. "The step did nothing" has
  // two very different causes and these tell them apart: a page of the
  // database with no filter, and the keyed read the extractor makes. If the
  // first is zero the backend cannot see the database; if only the second is
  // zero the filter is wrong. That is how the paging bug above was found.
  try {
    const all = await ctx.db.query({ db: DB_CORPUS, limit: 50 });
    const fresh = await ctx.db.query({ db: DB_CORPUS, field: "status", key: "new", limit: 50 });
    steps.corpusDocs = Array.from(all).length;
    steps.corpusUnprocessed = Array.from(fresh).length;
  } catch (err) {
    steps.corpusDocs = "read failed: " + String((err && err.message) || err).slice(0, 200);
  }

  await run("collect", () => collect(ctx, state, now));
  await run("extract", () => extract(ctx, state, now));
  await run("measure", () => measure(ctx, state, now));
  await run("harvest", () => harvest(ctx, state, now));
  await run("dress", () => dress(ctx, state, now));
  await run("assemble", () => assemble(ctx, state, now));

  await putIfChanged(ctx, { _id: TICK_REPORT_ID, type: "tickreport", steps }, DB_CORPUS);
  await saveState(ctx, { ...state, lastTickAt: now });
}
