import type { Subsample } from "@/types/subsample";

/** Refresh fixture-owned fields after HMR while keeping the mutable contact selection. */
export function refreshSubsampleFixtures(current: Subsample[], fixtures: Subsample[]) {
  const fixturesById = new Map(fixtures.map(item => [item.id, item]));
  for (const item of current) {
    const fixture = fixturesById.get(item.id);
    if (!fixture) continue;
    const contacts = item.settingsOverrides?.contacts;
    const next = structuredClone(fixture);
    if (contacts) next.settingsOverrides = { ...next.settingsOverrides, contacts: structuredClone(contacts) };
    // Remove retired optional fixture fields as well as updating existing fields.
    for (const key of Object.keys(item)) delete (item as unknown as Record<string, unknown>)[key];
    Object.assign(item, next);
  }
  const knownIds = new Set(current.map(item => item.id));
  current.push(...structuredClone(fixtures.filter(item => !knownIds.has(item.id))));
}
