import assert from "node:assert/strict";
import test from "node:test";
import { conversionRate, metricDifference, fieldMetricRows } from "../src/features/subsamples/field-metrics";
import { subsamples } from "../src/lib/repositories/mock/fixture-store";

test("conversion uses completes over visitors and does not divide by zero", () => {
  assert.equal(conversionRate(65, 100), 65);
  assert.equal(conversionRate(0, 100), 0);
  assert.equal(conversionRate(0, 0), undefined);
});
test("differences use unrounded actual minus expected and preserve missing versus zero", () => {
  assert.equal(metricDifference(65, 70), -5);
  assert.equal(metricDifference(4, 8), -4);
  assert.equal(metricDifference(0, 0), 0);
  assert.equal(metricDifference(undefined, 0), undefined);
  assert.equal(metricDifference(1, undefined), undefined);
});
test("Abandon is supplied independently and missing estimates remain unavailable", () => {
  const item = { ...subsamples[0], expectedMetrics: undefined, abandonRate: undefined };
  const rows = fieldMetricRows(item);
  assert.equal(rows.find(row => row.label === "Total Abandon")?.actual, undefined);
  assert.ok(rows.every(row => row.expected === undefined));
  const supplied = fieldMetricRows({ ...item, abandonRate: 0, expectedMetrics: { abandonRate: 17 } });
  assert.equal(supplied[3].actual, 0);
  assert.equal(metricDifference(supplied[3].actual, supplied[3].expected), -17);
});
