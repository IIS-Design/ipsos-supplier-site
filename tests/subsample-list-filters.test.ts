import assert from "node:assert/strict";
import test from "node:test";
import { filterSubsamples, type SubsampleListFilters } from "../src/features/subsamples/subsample-list-filters";
import { subsamples } from "../src/lib/repositories/mock/fixture-store";
const defaults: SubsampleListFilters = { query: "", status: "all", language: "all", router: "all", from: "", to: "" };

test("All Subsamples filters intersect, search names/IDs and preserve repository order", () => {
  const first = subsamples[0];
  assert.deepEqual(filterSubsamples(subsamples, defaults), subsamples);
  assert.equal(filterSubsamples(subsamples, { ...defaults, query: ` ${first.id.toUpperCase()} ` })[0].id, first.id);
  assert.ok(filterSubsamples(subsamples, { ...defaults, query: first.name.toUpperCase() }).some(item => item.id === first.id));
  const filters = { ...defaults, status: first.status, language: first.language, router: first.router || "unassigned", from: first.fieldEndDate, to: first.fieldEndDate };
  const results = filterSubsamples(subsamples, filters);
  assert.ok(results.some(item => item.id === first.id));
  assert.ok(results.every(item => item.status === first.status && item.language === first.language && item.router === first.router && item.fieldEndDate === first.fieldEndDate));
  assert.deepEqual(filterSubsamples(subsamples, { ...filters, query: "no-matching-subsample" }), []);
});
test("date bounds are inclusive and use field end, not start dates", () => {
  const item = subsamples.find(item => item.fieldStartDate !== item.fieldEndDate)!;
  assert.equal(filterSubsamples([item], { ...defaults, from: item.fieldEndDate, to: item.fieldEndDate }).length, 1);
  assert.equal(filterSubsamples([item], { ...defaults, to: item.fieldStartDate }).length, 0);
});
