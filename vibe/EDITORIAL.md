# House style for the blurb

Every link gets one short piece of writing that is not a summary. This file is
what that writing is supposed to sound like, and it is the file to argue with
if the blurbs read wrong.

## Where it sits on the page

The commentary comes first, before the quote and before the link. A reader
decides whether they care from a sentence with a view in it, not from a
headline they have to interpret. Under the commentary sits one large pull
quote in the poster's own words, and under that, small, the link and its
numbers, for the reader who has already decided.

That order is the whole reason the writing has to be good. It is the first
thing on the page and there is nothing above it to hide behind.

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
4. **Do not open with a quotation.** The reader already sees a large pull
   quote from the post directly beneath the commentary, so a blurb that starts
   with one says the same thing twice and every entry starts to look the same.
   Quote a phrase inline when it does work in the middle of your own sentence.
   The poster usually did say it better, which is what the pull quote is for.
5. **The numbers are a hook once, not every time.** Two points and forty
   replies means the subreddit argued about something it never voted on, and
   that is worth a clause. But a tidy observation about the score and the
   comment count at the end of every blurb is a formula, and the first three
   drafts written under this file each reached for it. So the material is only
   offered to the drafter when the gap is genuinely the story. Everywhere else,
   the hook is in what the post says.
6. **No summary verbs.** Nothing "explores", "delves into", "highlights" or
   "sheds light on". If the sentence would survive being pasted under a
   different link, delete it.
7. **No em-dashes and no rule-of-three cadence.** This audience reads those as
   a machine's fingerprints and says so in the comments. That is not a
   superstition, it is what the corpus shows them doing.
8. **Never invent, and that includes a life.** Everything in the blurb comes
   from the post, its numbers, or the corpus answer that surfaced it. If a
   claim needs a fact nobody wrote down, cut the claim.

   The sharpest version of this rule, learned from the first full page of
   drafts: **a view is allowed, a past is not.** Three blurbs claimed personal
   history nobody has. "I have watched enough people learn that the expensive
   way." "I've been waiting for this thread since roughly March." A reader who
   works out that the writer has no March is not annoyed at a turn of phrase,
   they stop believing the page, and they are right to. Have opinions about
   what is in front of you and no memories at all.

9. **Vary the opening.** Three of the first seven drafts began "The detail that
   stuck", "The trouble starts at", "The scary thing here is". If your first
   three words would fit under any other link on the page, they are not doing
   any work.

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
