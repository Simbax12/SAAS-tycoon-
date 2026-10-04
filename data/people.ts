// Copied from docs/GAME_DESIGN.md > Who the player hears from, and > Customer names.
// The docs win if the two disagree.

// Everyone who can send an email. Customers share one id; their first name comes from customerNames.
export type PersonId = "maya" | "sam" | "lena" | "omar" | "zoe" | "customer" | "dana" | "victor";

export type Person = { id: PersonId; name: string };

export const people: Person[] = [
  { id: "maya", name: "Maya" },
  { id: "sam", name: "Sam" },
  { id: "lena", name: "Lena" },
  { id: "omar", name: "Omar" },
  { id: "zoe", name: "Zoe" },
  { id: "customer", name: "Customer" },
  { id: "dana", name: "Dana" },
  { id: "victor", name: "Victor" },
];

export const personById = (id: PersonId): Person => people.find((p) => p.id === id)!;

// Each customer email shows the name given to its incident or item. Each name is used once.
export const customerNames: Record<string, string> = {
  "1.3": "Priya",
  "feat-darkmode": "Tom",
  "2.2": "Ana",
  "feat-photos": "Kofi",
  R2: "Mei",
  "3.2": "Jack",
  "feat-groups": "Sara",
  R4: "Leo",
  R6: "Aisha",
  "feat-voice": "Ben",
  "4.4": "Rosa",
  "5.1": "Chloe",
  "feat-translate": "Yuki",
  R10: "Femi",
};

// Victor's one line, before the guided answer shows (docs/UI_THEME.md > Dana and Victor).
export const victorLine = "This one. You owe me.";

// The name shown on an email. `about` is the incident or item id the email belongs to.
export function senderName(from: PersonId, about: string): string {
  if (from === "customer") return customerNames[about] ?? personById(from).name;
  return personById(from).name;
}
