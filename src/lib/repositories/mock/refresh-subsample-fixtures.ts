import type { Subsample } from "@/types/subsample";

/** Refresh fixture-owned fields after HMR while keeping saved mutable settings. */
export function refreshSubsampleFixtures(current: Subsample[], fixtures: Subsample[]) {
  const fixturesById = new Map(fixtures.map(item => [item.id, item]));
  for (const item of current) {
    const fixture = fixturesById.get(item.id);
    if (!fixture) continue;
    const overrides = item.settingsOverrides;
    const next = structuredClone(fixture);
    if (overrides) next.settingsOverrides = { ...next.settingsOverrides, ...structuredClone(overrides) };
    // Remove retired optional fixture fields as well as updating existing fields.
    for (const key of Object.keys(item)) delete (item as unknown as Record<string, unknown>)[key];
    Object.assign(item, next);
  }
  const knownIds = new Set(current.map(item => item.id));
  current.push(...structuredClone(fixtures.filter(item => !knownIds.has(item.id))));
}
