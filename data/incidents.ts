// One lookup for every incident that has data: new incidents from docs/CHALLENGES.md and
// repeats from docs/REPEATS.md. Builds join them in Milestone 6.
// Both kinds share the fields the engine needs on every incident: id, title, stage, arrives,
// usersGained, sees, nudge and clues.

import { challengeById, type Challenge } from "./challenges";
import { repeatById, type Repeat } from "./repeats";

export type IncidentData = Challenge | Repeat;

export const isRepeat = (incident: IncidentData): incident is Repeat => "cards" in incident;

export const incidentById = (id: string): IncidentData | undefined => challengeById(id) ?? repeatById(id);

// The pattern an incident teaches or practises, by its Pattern Book name.
export const patternOf = (incident: IncidentData): string => (isRepeat(incident) ? incident.pattern : incident.pattern.name);
