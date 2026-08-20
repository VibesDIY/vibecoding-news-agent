import React, { useState } from "react";
import { useFireproof } from "use-vibes";

const C = {
  bg: "var(--vibes-bg, #faf9f7)",
  fg: "var(--vibes-fg, #16150f)",
  muted: "var(--vibes-muted, #6b6a62)",
  line: "var(--vibes-border, #ddd9d0)",
  card: "var(--vibes-card-bg, #ffffff)",
  accent: "var(--vibes-accent, #b4441c)",
};

const REPO = "https://github.com/VibesDIY/vibecoding-news-agent";

function Shell({ children }) {
  return (
    <div style={{ background: C.bg, color: C.fg, minHeight: "100vh", padding: "28px 18px 64px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "Georgia, 'Iowan Old Style', serif", lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}

function Masthead() {
  return (
    <header style={{ borderBottom: "2px solid " + C.fg, paddingBottom: 14, marginBottom: 22 }}>
      <h1 style={{ fontSize: 30, margin: "0 0 6px", letterSpacing: "-0.01em" }}>r/vibecoding link round-up</h1>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>
        Somebody has to read the whole subreddit so you do not have to. That somebody is a program, which reads all of
        it, has no opinions worth having, and hands the good bits to a person who does. What follows is the good bits.
      </p>
      <p style={{ margin: "12px 0 0", fontSize: 13, color: C.muted }}>
        Each entry opens with its own shape: the top row is votes, the bottom row is replies. When the bottom row runs
        away from the top one, a lot of people had something to say and most of the subreddit never saw it. Those
        are marked in red, and they are usually the ones worth opening.
      </p>
    </header>
  );
}

function Links({ urls }) {
  if (!urls || !urls.length) return null;
  return (
    <p style={{ margin: "6px 0 0", fontSize: 13 }}>
      {urls.map((u, i) => (
        <a key={u} href={u} target="_blank" rel="noreferrer" style={{ color: C.accent, marginRight: 10 }}>
          source {i + 1}
        </a>
      ))}
    </p>
  );
}

function Item({ f, rank }) {
  return (
    <li style={{ listStyle: "none", padding: "14px 0", borderBottom: "1px solid " + C.line }}>
      <div style={{ fontSize: 17, fontWeight: 600 }}>
        {rank ? <span style={{ color: C.muted, marginRight: 8 }}>{rank}.</span> : null}
        {f.entity}
        {typeof f.mentions === "number" ? (
          <span style={{ color: C.muted, fontWeight: 400, fontSize: 14 }}>
            {" "}
            ({f.mentions.toLocaleString()} mentions
            {typeof f.sentiment === "number" ? ", sentiment " + f.sentiment : ""})
          </span>
        ) : null}
      </div>
      {f.claim ? <div style={{ fontSize: 16 }}>{f.claim}</div> : null}
      {f.verifiedNote ? <div style={{ fontSize: 14 }}>checked: {f.verifiedNote}</div> : null}
      {f.sentiment && typeof f.sentiment !== "number" ? (
        <div style={{ fontSize: 13, color: C.muted }}>sentiment: {f.sentiment}</div>
      ) : null}
      <Links urls={f.permalinks} />
    </li>
  );
}

function Tag({ children, tone }) {
  return (
    <span
      style={{
        fontSize: 12,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: tone === "alert" ? C.accent : C.muted,
        border: "1px solid " + (tone === "alert" ? C.accent : C.line),
        borderRadius: 3,
        padding: "1px 6px",
        marginRight: 8,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// A visual fingerprint for each entry, drawn from the thread itself.
//
// No screenshot and no illustration. Reddit refuses machine reads, so a
// screenshot would mean pointing another service at a page we cannot verify,
// and a generated picture of a conversation is decoration pretending to be
// evidence. What each thread does have is a shape: how many people voted and
// how many people replied.
//
// So the plate draws that. A row of votes over a row of replies, hue keyed to
// the thread id so no two entries look alike, and the accent colour when the
// replies ran away from the votes. It is ornament that happens to be the
// argument the page is making, and you can read the gap across the whole
// column without looking at a single number.
function hashOf(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) % 100000;
  return h;
}

function Plate({ l }) {
  const h = hashOf(l.url);
  const hue = h % 360;
  const votes = Math.max(0, Math.min(l.score || 0, 44));
  const replies = Math.max(0, Math.min(l.comments || 0, 44));
  const skew = (h % 7) - 3;
  const ink = l.underseen ? C.accent : "hsl(" + hue + ", 42%, 42%)";
  const wash = "hsl(" + hue + ", 46%, 94%)";
  const mark = (n, y, w) =>
    Array.from({ length: n }, (_, i) => (
      <rect key={y + "-" + i} x={6 + i * 9} y={y} width={w} height={w === 3 ? 14 : 5} rx={1.5} fill={ink} />
    ));
  return (
    <svg
      viewBox="0 0 420 56"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: 56, background: wash, borderRadius: 4, marginBottom: 14 }}
    >
      <g transform={"translate(" + skew + ",0)"}>
        {mark(votes, 10, 5)}
        {mark(replies, 34, 3)}
      </g>
    </svg>
  );
}

// The commentary arrives with one or two phrases wrapped in asterisks, the
// way a person marks a pull line while writing. Nothing else about the text is
// markdown, so this splits on that one pattern rather than pulling in a parser.
function Emphasised({ text }) {
  const parts = String(text || "").split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
    </>
  );
}

function LinkRow({ l }) {
  const commentary = l.blurb || l.blurbDraft;
  return (
    <li style={{ listStyle: "none", padding: "34px 0", borderBottom: "1px solid " + C.line }}>
      {/* The writing comes first. A reader decides whether they care from the
          commentary, not from a headline they have to interpret. */}
      <Plate l={l} />

      {l.headline ? (
        <h2 style={{ margin: "0 0 8px", fontSize: 27, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{l.headline}</h2>
      ) : null}

      {commentary ? (
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
          <Emphasised text={commentary} />
        </p>
      ) : null}

      {l.excerpt ? (
        <blockquote
          style={{
            margin: commentary ? "20px 0 0" : 0,
            padding: "0 0 0 20px",
            borderLeft: "4px solid " + C.accent,
            fontSize: 24,
            lineHeight: 1.4,
            fontStyle: "italic",
            color: C.fg,
          }}
        >
          {l.excerpt}
          {l.excerpt.length >= 260 && !l.excerpt.endsWith("...") ? "…" : ""}
        </blockquote>
      ) : null}

      {/* The link and its numbers sit under the writing, small, where a reader
          goes once they have decided. */}
      {/* The link line, in the 2007 grammar: the word Link carries the
          destination, the source title names it, and the provenance says how
          the item turned up. */}
      <div style={{ marginTop: 18, fontSize: 14, color: C.muted }}>
        <a href={l.url} target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>
          {l.author ? "u/" + l.author : "r/" + (l.subreddit || "vibecoding")} · {l.comments} comments · {l.score}{" "}
          {l.score === 1 ? "point" : "points"}
          {l.subreddit && l.subreddit !== "vibecoding" ? " · r/" + l.subreddit : ""}
        </a>
        {l.underseen ? <span> · more talk than votes</span> : null}
      </div>
    </li>
  );
}

function Method({ report }) {
  const [open, setOpen] = useState(false);
  return (
    <section style={{ marginTop: 34, background: C.card, border: "1px solid " + C.line, borderRadius: 10, padding: 18 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          font: "inherit",
          fontWeight: 700,
          color: C.fg,
          cursor: "pointer",
        }}
      >
        {open ? "Hide" : "Show"} how this was made, and who made it
      </button>
      {open ? (
        <div style={{ fontSize: 15, marginTop: 12 }}>
          <p>
            This is built by <a href="https://vibes.diy/" style={{ color: C.accent }}>Vibes DIY</a>, which sells a tool
            for building apps by describing them. That makes us a vendor in the same category some of these findings
            cover, and you should read us that way. The semantic index behind it was built by Marcus Estes, who
            moderates r/vibecoding and works with us. We benefit if you think well of us, which is the whole reason the
            code is public rather than just the conclusions.
          </p>
          <p>
            The agent collects and counts. It does not write the published write-up. Prose is a separate pass and a
            person edits it before anything is posted anywhere.
          </p>
          <p>
            A thing is ranked only when the index counted it and a verification pass confirmed it is real and distinct.
            Everything else is listed as a lead, and the count of leads is on the page so you can weigh the rest. The
            counts are index-wide: they say how much the subreddit discusses a tool in general, not what it said in
            answer to the questions behind this report.
          </p>
          <p style={{ marginBottom: 0 }}>
            Think a question is leading, a source is junk, or something got graded unfairly?{" "}
            <a href={REPO} style={{ color: C.accent }}>
              Send a pull request
            </a>
            . The questions, the prompts and the scoring are all in that repo.
            {report ? " This page was generated " + report.generatedAt + "." : ""}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default function App() {
  // One database, and the access function decides what reaches a reader: the
  // current edition is on a public channel, everything else is on the desk
  // and never leaves it. So this query is the whole page.
  const { useLiveQuery } = useFireproof("newsroom");
  const { docs: reports } = useLiveQuery("type", { key: "report", limit: 5 });

  // Every report doc carries the same index key, so ordering falls back to _id.
  // Sort on the day the report is for and take the newest.
  const sorted = (reports || []).slice().sort((a, b) => String(a.day).localeCompare(String(b.day)));
  const report = sorted.length ? sorted[sorted.length - 1] : null;


  return (
    <Shell>
      <Masthead />

      {!report ? (
        <p style={{ fontSize: 16 }}>
          No round-up has been assembled yet. The collector runs on a schedule and this page fills in when it has read
          enough to have something to link to.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 0 }}>
            {report.day} &middot; {report.counts.links} links, {report.counts.underseen} of them with more talk than
            votes
          </p>

          {report.roundup && report.roundup.length ? (
            <section style={{ marginBottom: 30 }}>
              <ul style={{ padding: 0, margin: 0 }}>
                {report.roundup.map((l) => (
                  <LinkRow key={l.url} l={l} />
                ))}
              </ul>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 10 }}>
                Ordered by alternating between threads the subreddit voted up and threads that drew a lot more
                discussion than votes. The second kind is the reason to read a round-up rather than the front page:
                plenty of people had something to say and almost nobody saw it.
              </p>
            </section>
          ) : null}

          {/* Everything under the round-up is the working material it was
              chosen from. It reads as reference rather than as prose, so it
              sets in columns: one on a phone, more as the screen allows. */}
          <section style={{ marginTop: 34, borderTop: "2px solid " + C.fg, paddingTop: 20 }}>
            <h2 style={{ fontSize: 20, margin: "0 0 4px" }}>The working</h2>
            <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
              What the round-up was chosen from. Counts are index-wide: they describe r/vibecoding overall rather than
              the questions behind this edition.
            </p>

            <div
              style={{
                display: "grid",
                // One column on a phone, two in the middle, three at full
                // width. The prose column stays 760 wide because that is what
                // reads well; only the reference material packs.
                gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))",
                gap: "8px 28px",
                alignItems: "start",
              }}
            >
              {report.ranked && report.ranked.length ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <h3 style={{ fontSize: 15, margin: "0 0 6px" }}>Counted and confirmed</h3>
                </div>
              ) : null}
              {(report.ranked || []).map((f, i) => (
                <Item key={"r" + i} f={f} rank={i + 1} />
              ))}

              {report.unverified && report.unverified.length ? (
                <div style={{ gridColumn: "1 / -1", marginTop: 14 }}>
                  <h3 style={{ fontSize: 15, margin: "0 0 6px" }}>Counted, not yet checked</h3>
                </div>
              ) : null}
              {(report.unverified || []).map((f, i) => (
                <Item key={"u" + i} f={f} />
              ))}

              {report.leads && report.leads.length ? (
                <div style={{ gridColumn: "1 / -1", marginTop: 14 }}>
                  <h3 style={{ fontSize: 15, margin: "0 0 6px" }}>Leads</h3>
                  <p style={{ fontSize: 13, color: C.muted, margin: "0 0 6px" }}>
                    Claims pulled from a synthesis. Pointers to threads, not measurements.
                  </p>
                </div>
              ) : null}
              {(report.leads || []).map((f, i) => (
                <Item key={"l" + i} f={f} />
              ))}
            </div>
          </section>

          {/* The honest state of the report, at the end, where a reader
              arrives after seeing what it is based on rather than before. */}
          <section style={{ marginTop: 30, fontSize: 14, color: C.muted }}>
            {report.counts.ranked === 0 ? (
              <p style={{ margin: 0 }}>
                Nothing here has survived a by-name query and a verification pass, so nothing is ranked. That is the
                honest state of this edition: {report.counts.entities} counted tools, none of them checked yet,{" "}
                {report.counts.leads} claims, {report.counts.links} links.
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                {report.counts.ranked} of {report.counts.entities} counted tools have been checked by hand.{" "}
                {report.counts.unverified} have not, and are listed rather than ranked.
              </p>
            )}
          </section>
        </>
      )}

      <Method report={report} />
    </Shell>
  );
}
