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

function Masthead({ status }) {
  return (
    <header style={{ borderBottom: "2px solid " + C.fg, paddingBottom: 14, marginBottom: 22 }}>
      <h1 style={{ fontSize: 30, margin: "0 0 6px", letterSpacing: "-0.01em" }}>What r/vibecoding is saying</h1>
      <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>
        An agent reads a semantic index of the subreddit and writes down what it finds. The code that produces this page
        is public, and so is every answer it read.
      </p>
      {status && status.state !== "ok" ? (
        <p style={{ margin: "10px 0 0", fontSize: 13, color: C.accent }}>Collector status: {status.message}</p>
      ) : null}
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
          <span style={{ color: C.muted, fontWeight: 400, fontSize: 14 }}> ({f.mentions} mentions)</span>
        ) : null}
      </div>
      <div style={{ fontSize: 16 }}>{f.claim}</div>
      {f.sentiment ? <div style={{ fontSize: 13, color: C.muted }}>sentiment: {f.sentiment}</div> : null}
      <Links urls={f.permalinks} />
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
            A finding is ranked only when a query naming it came back with a count and a verification pass confirmed it.
            Everything else is listed below as a lead, and the count of leads is on the page so you can weigh the rest.
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
  const { useLiveQuery } = useFireproof("findings");
  const { useLiveQuery: useCorpus } = useFireproof("corpus");
  const { docs: reports } = useLiveQuery("type", { key: "report", descending: true, limit: 5 });
  const { docs: statuses } = useCorpus("type", { key: "status", limit: 1 });

  const report = reports && reports.length ? reports[0] : null;
  const status = statuses && statuses.length ? statuses[0] : null;

  return (
    <Shell>
      <Masthead status={status} />

      {!report ? (
        <p style={{ fontSize: 16 }}>
          No report has been assembled yet. The collector runs on a schedule and this page fills in when it has read
          enough to say something.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 0 }}>
            {report.day} &middot; {report.counts.findings} findings from {report.counts.sources} corpus answers &middot;{" "}
            {report.counts.rankable} confirmed with a count, {report.counts.leads} still leads
          </p>

          {report.ranked && report.ranked.length ? (
            <section>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>Confirmed, with counts</h2>
              <p style={{ fontSize: 14, color: C.muted, marginTop: 0 }}>
                Each of these was queried by name and checked against the raw answer.
              </p>
              <ul style={{ padding: 0, margin: 0 }}>
                {report.ranked.map((f, i) => (
                  <Item key={f.entity + i} f={f} rank={i + 1} />
                ))}
              </ul>
            </section>
          ) : (
            <section>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>Nothing is confirmed yet</h2>
              <p style={{ fontSize: 15, marginTop: 0 }}>
                Nothing below has survived a by-name query and a verification pass, so nothing is ranked. That is the
                honest state of this report, and the list underneath is what the agent has to work with.
              </p>
            </section>
          )}

          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>Leads</h2>
            <p style={{ fontSize: 14, color: C.muted, marginTop: 0 }}>
              Pulled from a broad question rather than a query naming the thing. Read these as pointers to threads worth
              opening, not as measurements.
            </p>
            <ul style={{ padding: 0, margin: 0 }}>
              {(report.leads || []).map((f, i) => (
                <Item key={f.entity + i} f={f} />
              ))}
            </ul>
          </section>
        </>
      )}

      <Method report={report} />
    </Shell>
  );
}
