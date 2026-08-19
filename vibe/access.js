// Who may write what. The short version: nobody but the owner, and the owner
// mostly means the scheduled generator, which runs as the owner.
//
// Reads are public. A report nobody outside the project can read would defeat
// the point of publishing the method.

function published(user, oldDoc, doc, channel) {
  // Deletes and edits alike: the write has to come from the owner account.
  // The scheduled tick runs as the owner, so the generator passes here and a
  // signed-in visitor does not.
  if (!user || !user.isOwner) {
    throw { forbidden: "this app publishes; it does not take submissions. Send a pull request instead: https://github.com/VibesDIY/vibecoding-news-agent" };
  }
  // Two grants. `public` opens the channel to readers. The explicit
  // self-grant opens it to the writer, who is the owner, because grants are
  // keyed by handle and a channel carrying no grant for your handle can be
  // unreadable by you even when you wrote every document in it. It was added
  // while chasing a read that returned nothing, and that turned out to have a
  // different cause, so treat it as belt and braces rather than as the fix
  // for anything.
  return { channels: [channel], grant: { public: [channel], users: { [user.userHandle]: [channel] } } };
}

// Raw answers from the corpus, the question list, the rate budget and the
// refresh status. Public on purpose: the input to a report is as much part of
// the method as the report.
export function corpus(doc, oldDoc, user) {
  return published(user, oldDoc, doc, "corpus");
}

// Findings, the collector's state doc and the draft reports.
export function findings(doc, oldDoc, user) {
  return published(user, oldDoc, doc, "reports");
}

export default function (doc, oldDoc, user) {
  return published(user, oldDoc, doc, "reports");
}
