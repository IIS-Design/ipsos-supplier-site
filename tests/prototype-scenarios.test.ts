import assert from "node:assert/strict";
import test from "node:test";
import { scenarioTab, subsampleScenarios, reportScenarios } from "../src/features/subsamples/scenarios";

test("new workspace routes expose independent scenario catalogues", () => {
  for (const tab of ["details", "field-progress", "links", "security", "contacts", "costs"] as const) {
    assert.equal(scenarioTab(`/projects/p/subsamples/s/${tab}`), tab);
    const ids = subsampleScenarios[tab].map(item => item[0]);
    assert.equal(new Set(ids).size, ids.length);
  }
});
test("entry links include single/multiple/partial/long/empty previews", () => {
  const ids: string[] = subsampleScenarios.links.map(item => item[0]);
  for (const id of ["links-single", "links-multiple", "links-partial", "links-no-live", "links-long", "empty"]) assert.ok(ids.includes(id));
});

test("reports cover all status previews and a clean empty state", () => {
  const ids: string[] = reportScenarios.map(item => item[0]);
  for (const id of ["reports-all", "reports-queued", "reports-executing", "reports-finished", "reports-error", "reports-empty"]) assert.ok(ids.includes(id));
});
