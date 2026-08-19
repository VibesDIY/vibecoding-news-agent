# The generator, as a deployed app

This directory is the agent. It is a [Vibes DIY](https://vibes.diy/) app, which
means the whole thing runs on a schedule in the cloud with no server to operate,
and the three files here are all of it.

Live: <https://vibes.diy/vibe/jchris/vibecoding-news>

| File | What it is |
|---|---|
| `backend.js` | the scheduled generator: collect, extract, measure, assemble |
| `access.js` | who may write (the owner, which in practice means the tick) and who may read (anyone) |
| `App.jsx` | the page the report is published on |

## The pipeline

1. **collect** asks the corpus one question and, on a later tick, picks up the
   cited answer. Two ticks because a handler gets 15 seconds of outbound HTTP
   and the corpus takes minutes to think.
2. **extract** turns one answer into `finding` documents with `ctx.callAI`.
   These are claims the synthesis made, with whatever reddit permalinks it
   cited. They are leads.
3. **measure** takes the corpus's own per-entity table out of the same answer:
   how many times each entity appears across the whole index and the sentiment
   of those mentions. These are numbers, not impressions, and they are
   **index-wide**. Three different questions on 2026-08-19 returned
   byte-identical tables, so the table describes r/vibecoding in general and
   not the question it arrived with. Every surface that prints these numbers
   says that, because a count printed under a question will be read as
   answering it.
4. **harvest** turns each cited post into a link carrying its score and comment
   count, and marks the ones where discussion ran far ahead of votes.
5. **dress** drafts one blurb per tick with the strongest model available, in
   the house style in [EDITORIAL.md](EDITORIAL.md). Drafts are never published.
6. **assemble** builds the round-up and writes the draft.

## The ordering rule

The round-up alternates: a thread the subreddit voted up, then a thread that
drew a lot more discussion than votes, then back again. Both halves are needed.
A list of only top posts is one the reader has already seen, and a list of only
overlooked threads reads as a pose.

A link counts as underseen at eight or more comments and at least four comments
per point. Those two numbers are in `backend.js` and are the kind of thing a
pull request should argue with. Every link carries its raw score and comment
count so you can apply your own rule instead.

## The rule that shapes the data model

A claim pulled out of a synthesis and a count taken from the index are not the
same kind of thing, so they are not the same kind of document. Only a measured
entity that a verification pass has confirmed can appear in a ranking. Anything
else is a lead, and the page says how many leads there are.

This is not caution for its own sake. The research this repo grew out of ranked
a YouTube channel as the community's top creator because a synthesis kept
mentioning him. Querying him by name returned 11 mentions at +0.12 sentiment,
which is neutral. The impression was wrong and the count was right, and a
generator that cannot tell them apart will publish the wrong one.

## The blurb, and where the gate actually is

The page is the draft. `dress` writes `blurbDraft` and the page shows it with a
`draft` marker; `tools/editorial.py approve --by <name> --text "..."` replaces
it with a person's words and drops the marker. The draft exists to save that
person from a blank page, not to replace them.

The gate that matters is further along: posting to r/vibecoding, from a
person's own account. This audience detects machine prose and mocks it above
the fold, and the corpus measures them doing exactly that, so nothing
machine-written goes to the subreddit without somebody having read every line.
What the page owes its readers is honesty about which lines those are, which is
what the marker is for.

## What it will not do

`backend.js` never publishes prose nobody has read. It produces analysis: entities,
counts, sentiment, permalinks. The write-up is a separate pass with a stronger
model and then a person edits it. That is a rule about credibility, not about
cost. This audience recognises machine-written copy and says so in the
comments.

## Running it yourself

```sh
npx vibes-diy push --app-slug your-slug   # deploy your fork
npx vibes-diy app status <handle>/<slug>  # last tick, next tick, failures
npx vibes-diy app logs <handle>/<slug> --since 1h
```

The generator holds no API key. `ctx.callAI` bills the account that owns the
app, so a fork spends your credits and not ours.

## The one part that is not automatic yet

`backend.js` knows how to call the corpus and tries on every tick. The platform
currently refuses the call: a vibe may reach hosts that would answer a browser
on its own page, and the corpus API answers `Disallowed CORS origin` to every
origin but its own. The collector records that refusal on the page instead of
failing quietly, and `tools/ingest.py` carries answers in until one of two
things happens outside this repo: the corpus serves an
`Access-Control-Allow-Origin` header, or its host joins the platform's allowed
list. Either one and the collector starts feeding itself, with no code change
here.
