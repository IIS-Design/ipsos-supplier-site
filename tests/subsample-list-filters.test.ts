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

test("multi-select values use OR within a filter and AND across filters", () => {
  const first = subsamples[0];
  const second = { ...first, id: "multi-second" as typeof first.id, status: first.status === "live" ? "pending" as const : "live" as const, language: "Another language", languages: ["Another language"], router: null };
  const items = [first, second];
  const selected = { ...defaults, status: [first.status, second.status], language: [first.language, second.language], router: [] };
  assert.deepEqual(filterSubsamples(items, selected), items);
  assert.deepEqual(filterSubsamples(items, { ...selected, language: [first.language] }), [first]);
  assert.deepEqual(filterSubsamples(items, { ...selected, router: ["unassigned"] }), items.filter(item => !item.router));
  assert.deepEqual(filterSubsamples(items, { ...selected, status: [], language: [], router: [] }), items);
  assert.deepEqual(filterSubsamples(items, { ...selected, language: ["missing"] }), []);
});

test("a subsample can match any of its languages", () => {
  const item = { ...subsamples[0], country: "Canada", language: "en-CA", languages: ["en-CA", "fr-CA"] };
  assert.deepEqual(filterSubsamples([item], { ...defaults, language: ["fr-CA"] }), [item]);
  assert.deepEqual(filterSubsamples([item], { ...defaults, language: ["ro-RO"] }), []);
});
