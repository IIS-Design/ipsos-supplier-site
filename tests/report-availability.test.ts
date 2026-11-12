import assert from "node:assert/strict";
import test from "node:test";
import { getReports, createReport } from "../src/services/report-service";
import type { SupplierId } from "../src/types/ids";

test("retired report types are excluded from supplier-visible history", async () => {
  const reports = await getReports("supplier-northstar" as SupplierId);
  assert.ok(reports.length > 0);
  assert.ok(reports.every(report => report.type === "respondent_info"));
});
test("retired reports cannot be queued by the service", async () => {
  const report = (await getReports("supplier-northstar" as SupplierId))[0];
  for (const type of ["mini_router_quota", "survey_duration"] as const) assert.throws(() => createReport({ ...report, type }), /no longer available/);
});
