# vibecoding-news-agent

An agent that reads what the vibe coding community is actually saying and puts
the threads worth reading in one place. The output is a link round-up, dry on
purpose: a title, a link, its score and its comment count. The round-up is
published as an app, and from there a person posts it to r/vibecoding. The code
that picks the links is here, so you can check the method or change it.

Each link carries a short piece of writing that is not a summary: someone
pointing at the one detail that made them stop, with a view about it. A model
drafts those, the page shows them marked as drafts, and a person rewrites what
needs rewriting before any of it is posted anywhere. House style is in
[vibe/EDITORIAL.md](vibe/EDITORIAL.md), which is the file to argue with if the
blurbs read wrong.

The ordering is the opinionated part. It alternates between threads the
subreddit voted up and threads that drew far more discussion than votes. That
second kind is the reason to read a round-up at all: forty people replying to a
thread sitting at 2 points means the conversation happened and most of the
subreddit never saw it. A list of only top posts is a list you have already
read.

**Status: early.** The generator runs and produces draft reports. Nothing has
been published to Reddit yet, and the first post is a human step.

## Who made this, and what we get out of it

This is built by [Vibes DIY](https://vibes.diy/), which makes a tool for
building apps by describing them. That means we are a vendor in the same
category some of these reports will cover, and you should read us that way.

Two more things worth knowing up front:

* The semantic index of r/vibecoding that the agent queries was built by
  Marcus Estes, who moderates r/vibecoding and works with us.
* We benefit if you think well of us. That is the whole reason to publish the
  code rather than just the conclusions.

We are not going to argue our way out of that conflict of interest, because we
can't. What we can do is make the work checkable. If a ranking looks wrong,
the query that produced it is in this repo and you can run it yourself.

## Don't like the output? Send a pull request

That is not a figure of speech. The prompts, the queries, and the scoring are
all in here. If you think a question is leading, a source is junk, or a tool
got graded unfairly, open an issue or a PR and argue with the code.

We commit to two things:

1. We will not rank ourselves above where the data puts us. Where Vibes DIY
   appears in a report at all, it is subject to the same method as everything
   else, and the method is public.
2. We will publish reports whose findings are bad for us.

## What is a machine and what is a person

Worth being precise about, because "an AI wrote it" and "a person wrote it"
are different claims and both get made loosely.

| Step | Who |
|---|---|
| Querying the corpus, collecting findings | agent, on a schedule |
| Counting mentions and sentiment per entity | the corpus index, not a model |
| Checking that named things exist and are what they claim | agent plus human review |
| Writing the published prose | a language model, in a separate pass |
| Editing before anything is posted | a person |
| Posting | a person, under their own name |

No report goes out without a human editing it first. Posts come from a real
account belonging to a real person, not from a bot account.

## Where the reports go

Two places, and they are not the same thing.

**The app.** Every report is published to
<https://vibes.diy/vibe/jchris/vibecoding-news>, which is the generator itself.
The page you read is served by the same code that produced it, and the raw
answers behind it are in the same database. That is the whole point: there is
no gap between the report and the thing that made it.

**Reddit.** Reports also go to r/vibecoding, posted by a person under their own
name, after a human edit. Right now they do not: the drafts are app only while
the method settles and while the people whose community this is have a chance
to say what they think of it. Nothing has been posted to Reddit yet.

## Layout

```
vibe/      the generator, deployed as an app (backend.js, access.js, App.jsx)
tools/     the corpus harness, the loader, and the verification gate
reports/   published reports and the raw data behind each one
```

`vibe/` is the agent. It is a scheduled backend that asks the corpus a
question, extracts findings from the cited answer, pulls the corpus's own
per-entity counts out of the same answer, and assembles a draft. See
[vibe/README.md](vibe/README.md) for the pipeline and the rule that shapes it.

`tools/vg.py` is the harness that produced the first research pass. It runs a
list of questions against the corpus API, polls each request to its cited
answer, and saves the full JSON per query. Raw answers are kept because the
citations are the evidence a report rests on.

`tools/ingest.py` loads those saved answers into the generator's database, and
`tools/verify.py` is the gate every ranking has to pass: an entity's mention
count comes from the index, but whether that entity exists and is what it
appears to be gets checked separately, by hand, with the note recorded beside
the number.

The corpus API rate limits at 10 requests per hour, and `GET /stats` reports
that limit directly. Exceeding it has taken the analysis pipeline down for
hours while the health endpoint kept returning green, so the harness is
serial with a gap between calls and backs off on errors.

## Licence

Apache 2.0. See [LICENSE](LICENSE).
