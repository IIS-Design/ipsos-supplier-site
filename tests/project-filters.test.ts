import assert from "node:assert/strict";
import test from "node:test";
import { matchesAdvancedFilters } from "../src/features/projects/advanced-filters";

test("remaining buckets combine exclusive/shared and have no overlapping boundaries", () => {
  for (const [total, expected] of [[0, "zero"], [1, "1-50"], [50, "1-50"], [51, "51-200"], [200, "51-200"], [201, "200+"], [100000, "200+"]] as const) {
    const subsample = { status: "live" as const, exclusiveRemaining: Math.floor(total / 2), sharedRemaining: Math.ceil(total / 2) };
    const matches = (["zero", "1-50", "51-200", "200+"] as const).filter(range => matchesAdvancedFilters(subsample, "any", range));
    assert.deepEqual(matches, [expected]);
    assert.equal(matchesAdvancedFilters(subsample, "any", "any"), true);
  }
});

test("status combines with remaining, including canceled subsamples", () => {
  const subsample = { status: "canceled" as const, exclusiveRemaining: 10, sharedRemaining: 20 };
  assert.equal(matchesAdvancedFilters(subsample, "canceled", "1-50"), true);
  assert.equal(matchesAdvancedFilters(subsample, "live", "1-50"), false);
  assert.equal(matchesAdvancedFilters(subsample, "canceled", "zero"), false);
  assert.equal(matchesAdvancedFilters(subsample, "any", "any"), true);
});

test("multiple statuses use OR and still combine with remaining using AND", () => {
  const subsample = { status: "canceled" as const, exclusiveRemaining: 10, sharedRemaining: 20 };
  assert.equal(matchesAdvancedFilters(subsample, ["live", "canceled"], "1-50"), true);
  assert.equal(matchesAdvancedFilters(subsample, ["live", "pending"], "1-50"), false);
  assert.equal(matchesAdvancedFilters(subsample, ["live", "canceled"], "zero"), false);
  assert.equal(matchesAdvancedFilters(subsample, [], "any"), true);
  assert.equal(matchesAdvancedFilters(subsample, [], "zero"), false);
});

test("closed and canceled are independent subsample statuses", () => {
  const closed = { status: "closed" as const, exclusiveRemaining: 0, sharedRemaining: 0 };
  const canceled = { ...closed, status: "canceled" as const };
  assert.equal(matchesAdvancedFilters(closed, ["closed"], "any"), true);
  assert.equal(matchesAdvancedFilters(canceled, ["closed"], "any"), false);
  assert.equal(matchesAdvancedFilters(closed, ["canceled"], "any"), false);
  assert.equal(matchesAdvancedFilters(canceled, ["closed", "canceled"], "any"), true);
});
