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

## Where the draft is read, and what approval means

The page is the draft. Blurbs appear on it marked `draft` until a person has
been through them, because the reader this page is for right now is the person
deciding what gets posted, and hiding the draft from them hides the only thing
they came to read.

Approval is not a field. It is posting to r/vibecoding, which is a person's
decision and a person's account. What `tools/editorial.py` does is let that
person rewrite a blurb before it goes anywhere: `approve --by <name> --text
"..."` replaces the draft with their words and drops the marker.

The machine-prose problem has not gone away, it has moved to the right place.
Nothing machine-written reaches r/vibecoding without a person having read every
line, and the page says out loud which lines those are.
