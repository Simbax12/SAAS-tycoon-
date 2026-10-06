// One lookup for every incident that has data: new incidents from docs/CHALLENGES.md, repeats from
// docs/REPEATS.md and Builds from docs/BLUEPRINTS.md.
// All kinds share the fields the engine needs on every incident: id, title, stage, arrives,
// usersGained and nudge.

import { buildById, type Build } from "./blueprints";
import { challengeById, type Challenge } from "./challenges";
import { repeatById, type Repeat } from "./repeats";

export type IncidentData = Challenge | Repeat | Build;

export const isRepeat = (incident: IncidentData): incident is Repeat => "cards" in incident;

export const isBuild = (incident: IncidentData): incident is Build => "tray" in incident;

export const incidentById = (id: string): IncidentData | undefined => challengeById(id) ?? repeatById(id) ?? buildById(id);

// The pattern a new incident teaches or a repeat practises, by its Pattern Book name.
// A Build practises several, so it has none of its own.
export function patternOf(incident: IncidentData): string | undefined {
  if (isBuild(incident)) return undefined;
  return isRepeat(incident) ? incident.pattern : incident.pattern.name;
}
