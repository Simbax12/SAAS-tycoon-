// Turns a saved email key into the words shown on screen (docs/GAME_LOGIC.md > Email keys).
// A key that no longer points to anything gives undefined, and the Inbox hides it.

import { openers, startOfStage, thanksText } from "../data/emails";
import { incidentById } from "../data/incidents";
import { repeatById } from "../data/repeats";
import { senderName, type PersonId } from "../data/people";
import type { StageNumber } from "../data/stages";
import { requestFor } from "../data/upgrades";

export type EmailView = {
  key: string;
  from: PersonId;
  // The name on the email: a person's name, or a customer's first name.
  name: string;
  text: string;
  // The incident an "Investigate" button opens.
  investigate?: string;
  // The Shop item an "Open in Shop" button opens.
  shopItem?: string;
  // A refresher shows this repeat's pattern: icon, name, "Use this when" and "Also seen as" lines.
  refresher?: string;
};

const asStage = (s: string): StageNumber | undefined =>
  ["1", "2", "3", "4", "5"].includes(s) ? (Number(s) as StageNumber) : undefined;

export function emailView(key: string): EmailView | undefined {
  const at = key.indexOf(":");
  const kind = key.slice(0, at);
  const id = key.slice(at + 1);

  if (kind === "arrive" || kind === "thanks") {
    const arrives = incidentById(id)?.arrives;
    if (!arrives || arrives.by !== "email") return undefined;
    const name = senderName(arrives.from, id);
    if (kind === "arrive") return { key, from: arrives.from, name, text: arrives.text, investigate: id };
    const text = thanksText(arrives.from);
    return text ? { key, from: arrives.from, name, text } : undefined;
  }

  if (kind === "request") {
    const request = requestFor(id);
    if (!request) return undefined;
    return { key, from: request.from, name: senderName(request.from, id), text: request.text, shopItem: id };
  }

  if (kind === "opener") {
    const stage = id === "win" ? "win" : asStage(id);
    return stage ? { key, from: "maya", name: "Maya", text: openers[stage] } : undefined;
  }

  if (kind === "other") {
    const stage = asStage(id);
    const email = stage && startOfStage[stage];
    return email ? { key, from: email.from, name: senderName(email.from, key), text: email.text } : undefined;
  }

  // docs/GAME_DESIGN.md > Refreshers. Maya sends it. The list shows the pattern's name.
  if (kind === "refresher") {
    const repeat = repeatById(id);
    return repeat ? { key, from: "maya", name: "Maya", text: repeat.pattern, refresher: id } : undefined;
  }

  return undefined;
}
