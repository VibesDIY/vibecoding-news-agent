# House style for the blurb

Every link gets one short piece of writing that is not a summary. This file is
what that writing is supposed to sound like, and it is the file to argue with
if the blurbs read wrong.

## The model

Boing Boing when it was good. A person finds something, points at the one
detail that made them stop, and has an opinion about it. Two or three
sentences. You finish reading and you either click or you do not, and either
way you learned something.

What that is not: "In this thread, users discuss the challenges of deploying
AI-generated applications." Nobody has ever clicked on that sentence. It
describes the category the link belongs to, which is the one thing a reader
can already see from the title.

## The rules

1. **Lead with the specific thing.** Not the topic, the detail. "Three weeks
   in Lovable, fifty dollars, then someone tried to reset a password" beats
   "a post about production debugging" every time.
2. **Have a view.** Delighted, annoyed, unconvinced, quietly vindicated. A
   blurb with no attitude is a summary wearing a hat.
3. **Two or three sentences. Forty words is plenty.** If it needs more, the
   thread is the article and the blurb is the sign pointing at it.
4. **Quote when the poster said it better than you would.** They usually did.
5. **Say when the numbers are the story.** Two points and forty replies means
   the subreddit argued about something it never voted on. That is worth a
   clause, not a paragraph.
6. **No summary verbs.** Nothing "explores", "delves into", "highlights" or
   "sheds light on". If the sentence would survive being pasted under a
   different link, delete it.
7. **No em-dashes and no rule-of-three cadence.** This audience reads those as
   a machine's fingerprints and says so in the comments. That is not a
   superstition, it is what the corpus shows them doing.
8. **Never invent.** Everything in the blurb comes from the post, its numbers,
   or the corpus answer that surfaced it. If a claim needs a fact nobody
   wrote down, cut the claim.

## Why a person still signs it

The blurb is drafted by a model and published only after a human has read it
and either edited it or let it stand. That is not ceremony. This audience
detects machine prose reliably and mocks it above the fold, so a page full of
unread machine blurbs would cost more credibility than the whole round-up
earns. The draft is there to save a person from a blank page, not to replace
them.

Drafts live on the link document as `blurbDraft`. A human promotes one with
`tools/editorial.py`, which writes `blurb` and records who approved it. The
page shows `blurb` and never `blurbDraft`.
