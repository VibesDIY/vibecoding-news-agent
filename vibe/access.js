// Who may write, and what a reader ends up holding.
//
// Writes: the owner, which in practice means the scheduled generator running
// as the owner. Nobody else, on any document.
//
// Reads: channels decide, and that decides replication. A reader replicates
// what they may read, so the current edition goes on a public channel and
// everything else stays on the desk. The corpus answers run to tens of
// kilobytes each and the working documents behind one report came to about
// 120KB; none of it is needed to read a report, because the report document
// already carries everything the page prints.
//
// An edition moves to the desk the moment a newer one exists. Back numbers
// are not deleted, they stop being something every reader has to fetch, and
// the copy that matters is committed to the repository beside the raw answers
// it was built from.

export default function (doc, oldDoc, user) {
  if (!user || !user.isOwner) {
    throw {
      forbidden:
        "this app publishes; it does not take submissions. Send a pull request instead: https://github.com/VibesDIY/vibecoding-news-agent",
    };
  }
  const type = doc.type || (oldDoc && oldDoc.type);
  if (type === "report" && doc.archived !== true) {
    return { channels: ["edition"], grant: { public: ["edition"] } };
  }
  return { channels: ["desk"], grant: { users: { [user.userHandle]: ["desk"] } } };
}
