import assert from "node:assert/strict";
import test from "node:test";
import subsamples from "../src/data/subsamples.json";
import { formatSubsampleId } from "../src/lib/subsample-id";

test("supplier-facing subsample IDs preserve numeric values and leading zeros", () => {
  assert.equal(formatSubsampleId("subsample-1014592"), "1014592");
  assert.equal(formatSubsampleId("subsample-00123"), "00123");
  assert.equal(formatSubsampleId("1342524"), "1342524");
  assert.equal(formatSubsampleId({ id: "subsample-demo-01-01", sampleOneId: "1900000" }), "1900000");
});

test("formatting does not rewrite unknown identifiers or internal route keys", () => {
  const internal = "subsample-1014592";
  formatSubsampleId(internal);
  assert.equal(internal, "subsample-1014592");
  for (const value of ["preview-subsample", "subsample-custom", "project-1014592", "prefix-subsample-123"]) {
    assert.equal(formatSubsampleId(value), value);
  }
});

test("all available subsample fixtures have numeric display IDs without duplicate identities", () => {
  const displayed = subsamples.map(item => formatSubsampleId(item));
  assert.ok(displayed.length > 0);
  assert.ok(displayed.every(value => /^\d+$/.test(value)));
  assert.equal(new Set(displayed).size, displayed.length);
});
