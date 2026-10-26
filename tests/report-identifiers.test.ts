import assert from "node:assert/strict";
import test from "node:test";
import fixtures from "../src/data/reports.json";
import { nextReportId } from "../src/services/report-identifiers";

test("report IDs use a unique operational convention, including new reservations", () => {
  const ids = fixtures.map(report => report.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^RPT-\d{4}-\d{4,}$/);
  const reserved = Array.from({ length: 25 }, () => nextReportId(new Date(2026, 9, 23)));
  assert.equal(new Set([...ids, ...reserved]).size, ids.length + reserved.length);
  for (const id of reserved) assert.match(id, /^RPT-2026-\d{4,}$/);
});

test("report numbering starts a distinct sequence for another year", () => {
  const first = nextReportId(new Date(2090, 0, 1));
  const second = nextReportId(new Date(2090, 0, 1));
  assert.equal(first, "RPT-2090-0001");
  assert.equal(second, "RPT-2090-0002");
});
