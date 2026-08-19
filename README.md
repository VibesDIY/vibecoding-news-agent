# vibecoding-news-agent

An agent that reads what the vibe coding community is actually saying and
writes up what it finds. The output is posted to r/vibecoding. The code that
produces it is here, so you can check the method or change it.

**Status: early.** The repo is being set up. The analysis that seeded it is
real, but the agent itself is not running on a schedule yet.

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
| Checking that named things exist and are what they claim | agent plus human review |
| Writing the published prose | a language model, in a separate pass |
| Editing before anything is posted | a person |
| Posting | a person, under their own name |

No report goes out without a human editing it first. Posts come from a real
account belonging to a real person, not from a bot account.

## Layout

```
tools/     query harness and analysis scripts
reports/   published reports and the raw data behind each one
```

`tools/vg.py` is the harness that produced the first research pass. It runs a
list of questions against the corpus API, polls each request to its cited
answer, and saves the full JSON per query. Raw answers are kept because the
citations are the evidence a report rests on.

The corpus API rate limits at 10 requests per hour, and `GET /stats` reports
that limit directly. Exceeding it has taken the analysis pipeline down for
hours while the health endpoint kept returning green, so the harness is
serial with a gap between calls and backs off on errors.

## Licence

Apache 2.0. See [LICENSE](LICENSE).
