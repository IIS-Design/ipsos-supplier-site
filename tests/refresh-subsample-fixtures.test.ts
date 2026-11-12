import type { Subsample } from "../src/types/subsample";
import assert from "node:assert/strict";
import test from "node:test";
import { refreshSubsampleFixtures } from "../src/lib/repositories/mock/refresh-subsample-fixtures";
import { subsamples } from "../src/lib/repositories/mock/fixture-store";

test("HMR refreshes old subsample fields and preserves explicit empty contact overrides", () => {
  const fixture = subsamples.find(item => item.id === "subsample-1014592")!;
  const stale = { ...structuredClone(fixture), quotaTables: undefined, languages: undefined, entryLinks: undefined, settingsOverrides: { contacts: { mode: "override" as const, value: [] } } };
  const records: Subsample[] = [stale];
  refreshSubsampleFixtures(records, [fixture]);
  assert.deepEqual(records[0].quotaTables, fixture.quotaTables);
  assert.ok(records[0].quotaTables?.some(table => table.variables.includes("agerange")));
  assert.ok(records[0].quotaTables?.some(table => table.variables.includes("resp_gender")));
  assert.deepEqual(records[0].settingsOverrides?.contacts, { mode: "override", value: [] });
  assert.notEqual(records[0].quotaTables, fixture.quotaTables);
});
