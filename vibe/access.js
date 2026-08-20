// Who may write what, and what a reader ends up holding.
//
// Writes: nobody but the owner, and the owner mostly means the scheduled
// generator, which runs as the owner. Deletes and edits alike.
//
// Reads: channels decide, and that decides replication. A reader replicates
// the documents they may read, so putting the working material on a channel
// with no public grant is what keeps it off their machine.

const NO_SUBMISSIONS = {
  forbidden: "this app publishes; it does not take submissions. Send a pull request instead: https://github.com/VibesDIY/vibecoding-news-agent",
};

function ownerOnly(user) {
  if (!user || !user.isOwner) throw NO_SUBMISSIONS;
}

// The desk: everything the generator works with and no reader needs.
function desk(user) {
  return { channels: ["desk"], grant: { users: { [user.userHandle]: ["desk"] } } };
}

// Raw answers from the corpus, the question list, the rate budget, the tick's
// own diagnostics. All desk material: a single answer runs to tens of
// kilobytes and no reader needs one to read a report. Still readable by
// anyone with the CLI and the owner's permission, and still exported to the
// public repository, which is where checking the method actually happens.
export function corpus(doc, oldDoc, user) {
  ownerOnly(user);
  return desk(user);
}

// One database, two channels, and the split is what a visitor downloads.
//
// A reader replicates the documents they are allowed to read, so the current
// edition goes on a public channel and everything else goes on the desk: the
// corpus answers, the extracted claims, the counted entities, the per link
// working documents and the collector's own state. Rendering one report used
// to pull about 120KB of that material to every visitor, growing daily.
//
// The report document already carries everything the page prints, which is
// what makes this possible: the page needs one document, so the page gets one
// document.
//
// An archived edition moves to the desk too. Yesterday's number is not
// deleted, it just stops being something every reader has to fetch, and the
// copy that matters is committed to the repository beside the raw answers it
// was built from.
export function findings(doc, oldDoc, user) {
  ownerOnly(user);
  const type = doc.type || (oldDoc && oldDoc.type);
  if (type === "report" && doc.archived !== true) {
    return { channels: ["edition"], grant: { public: ["edition"] } };
  }
  return desk(user);
}

// Any database this app has not named: owner only, desk only. A new database
// should have to say why a reader needs it.
export default function (doc, oldDoc, user) {
  ownerOnly(user);
  return desk(user);
}
