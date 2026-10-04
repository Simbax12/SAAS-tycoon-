// Copied from docs/GAME_DESIGN.md > Tutorial and > First-time tips. The docs win if the two disagree.

// The tutorial runs inside this incident, the first in the play order.
export const TUTORIAL_INCIDENT = "1.1";

// What each step spotlights. The screen marks these places with a data-tour attribute.
export type TourTarget =
  | "inboxIcon"
  | "tutorialEmail"
  | "investigate"
  | "failingPart"
  | "options"
  | "callDana"
  | "trayCounters"
  | "shopIcon"
  | "alertInvestigate"
  | "repeatCards"
  | "logLines"
  | "blueprintTray"
  | "dial";

export type TutorialStep = { step: number; text: string; target: TourTarget };

// 8 words or fewer each.
export const tutorialSteps: TutorialStep[] = [
  { step: 1, text: "Open your Inbox.", target: "inboxIcon" },
  { step: 2, text: "Maya has a problem for you.", target: "tutorialEmail" },
  { step: 3, text: "Tap Investigate.", target: "investigate" },
  { step: 4, text: "Red means something is breaking.", target: "failingPart" },
  { step: 5, text: "Pick the fix you think is best.", target: "options" },
  { step: 6, text: "Stuck? Call Dana. Today it is free.", target: "callDana" },
  { step: 7, text: "Fixed. Users and cash go up.", target: "trayCounters" },
  { step: 8, text: "Spend cash in the Shop.", target: "shopIcon" },
];

export type TipId = "alert" | "request" | "repeat" | "triage" | "build" | "tune";

// Each tip is shown once, the first time its moment happens.
export const tips: { id: TipId; when: string; text: string; target: TourTarget }[] = [
  { id: "alert", when: "First server alert (1.2)", text: "Alerts pop up by themselves. Tap Investigate.", target: "alertInvestigate" },
  { id: "request", when: "First request email", text: "This email asks for something. Open the Shop.", target: "shopIcon" },
  { id: "repeat", when: "First repeat incident (R1)", text: "You have seen this before. Pick the pattern.", target: "repeatCards" },
  { id: "triage", when: "First Triage step (1.2)", text: "Tap the line that shows the cause.", target: "logLines" },
  { id: "build", when: "First Build incident (B1)", text: "Drag parts in. Join them with arrows.", target: "blueprintTray" },
  { id: "tune", when: "First Tune step (3.1)", text: "Set the dial. Then run the wave.", target: "dial" },
];
