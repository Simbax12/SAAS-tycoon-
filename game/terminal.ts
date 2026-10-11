// Runs a Terminal command on a Triage step's log lines, the way docs/EXTRA_STEPS.md > How a command
// runs says. It never changes the game state: only tapping a line does.

import { LOG_FILE, terminalText, type LogLine } from "../data/extraSteps";

export type CommandResult =
  | { kind: "lines"; lines: LogLine[] }
  | { kind: "text"; text: string }
  | { kind: "error"; text: string }
  | { kind: "clear" };

// Spaces and either kind of quote marks do not matter (docs/EXTRA_STEPS.md > How to read a lesson).
export const normalise = (command: string) =>
  command
    .replace(/[“”‘’']/g, '"')
    .trim()
    .replace(/\s+/g, " ");

// A command's words. A part in quotes stays one word, without its quotes.
export function words(command: string): string[] {
  return [...normalise(command).matchAll(/"([^"]*)"|(\S+)/g)].map((m) => m[1] ?? m[2]);
}

// A log line as the terminal prints it: level, source, a colon and the message.
export const lineText = (l: LogLine) => `${l.level} ${l.source}: ${l.message}`;

export function runCommand(command: string, lines: LogLine[]): CommandResult | null {
  const w = words(command);
  if (w.length === 0) return null;
  const [name, ...rest] = w;
  const file = rest.at(-1);
  const checkFile = () => (file !== LOG_FILE ? { kind: "error" as const, text: terminalText.noFile(file ?? "") } : null);

  switch (name) {
    case "clear":
      return { kind: "clear" };
    case "help":
      return { kind: "text", text: terminalText.help };
    case "ls":
      return { kind: "text", text: LOG_FILE };
    case "cat":
    case "tail":
      return checkFile() ?? { kind: "lines", lines };
    case "journalctl":
      if (rest[0] === "-p" && rest[1] === "warning") return { kind: "lines", lines: lines.filter((l) => l.level !== "INFO") };
      return { kind: "lines", lines };
    case "grep": {
      const bad = checkFile();
      if (bad) return bad;
      const flags = rest.slice(0, -1).filter((x) => x.startsWith("-"));
      const pattern = rest.slice(0, -1).filter((x) => !x.startsWith("-"))[0];
      if (!pattern) return { kind: "error", text: terminalText.noFile(file ?? "") };
      const any = flags.includes("-i");
      const terms = flags.includes("-E") ? pattern.split("|") : [pattern];
      const has = (l: LogLine) =>
        terms.some((t) => (any ? lineText(l).toLowerCase().includes(t.toLowerCase()) : lineText(l).includes(t)));
      return { kind: "lines", lines: lines.filter((l) => (flags.includes("-v") ? !has(l) : has(l))) };
    }
    default:
      return { kind: "error", text: terminalText.notFound(name) };
  }
}

// Whether the typed command is the one the task asks for.
export const isTaskCommand = (typed: string, task: string) => words(typed).join(" ") === words(task).join(" ");
