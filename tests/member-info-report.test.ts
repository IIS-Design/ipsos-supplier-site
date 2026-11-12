import assert from "node:assert/strict";
import test from "node:test";
import { createReportSchema, dateBounds, zonedDayStart, zonedDayEnd, zoneLabel } from "../src/features/reports/report-options";
import { createReport, getReports } from "../src/services/report-service";
import type { SupplierId } from "../src/types/ids";
import subsamples from "../src/data/subsamples.json";

test("MIR dates resolve in the organization zone, including 23/25 hour DST days", () => {
  assert.equal(zonedDayStart("2026-11-01", "America/Argentina/Buenos_Aires"), "2026-11-01T03:00:00.000Z");
  assert.equal(zonedDayEnd("2026-11-14", "America/Argentina/Buenos_Aires"), "2026-11-15T02:59:59.999Z");
  for (const [day, hours] of [["2026-03-08", 23], ["2026-11-01", 25]] as const) {
    assert.equal((Date.parse(zonedDayEnd(day, "America/New_York")) + 1 - Date.parse(zonedDayStart(day, "America/New_York"))) / 3600000, hours);
  }
  assert.equal(zoneLabel("America/Argentina/Buenos_Aires", "2026-11-01"), "Buenos Aires (UTC−03:00)");
});

test("MIR default dates and three-calendar-month boundary respect month ends", () => {
  assert.deepEqual(dateBounds("UTC", new Date("2026-05-31T12:00:00Z")), { from: "2026-05-17", to: "2026-05-31", min: "2026-02-28" });
});

test("MIR request validates dates, selections, codes and obsolete parameters", () => {
  const dates = dateBounds("UTC");
  const body = { type: "respondent_info", scope: { scopeType: "subsamples", subsampleIds: ["one", "two"] }, dateFrom: zonedDayStart(dates.from, "UTC"), dateTo: zonedDayEnd(dates.to, "UTC"), timeZone: "UTC", linkType: "both", reportType: "final_status", respondentStatus: ["3", "81"], respondentSubstatus: ["9", "108"], deduplicateSessions: false };
  assert.ok(createReportSchema.safeParse(body).success);
  assert.ok(createReportSchema.safeParse({ ...body, scope: { scopeType: "supplier" } }).success);
  for (const patch of [
    { scope: { scopeType: "subsamples", subsampleIds: [] } },
    { scope: { scopeType: "subsamples", subsampleIds: Array.from({ length: 11 }, (_, i) => `${i}`) } },
    { scope: { scopeType: "subsamples", subsampleIds: ["one", "one"] } },
    { dateFrom: "2020-01-01T00:00:00Z" }, { dateTo: "2020-01-01T00:00:00Z" },
    { dateFrom: "invalid" }, { dateTo: "invalid" }, { dateFrom: undefined }, { timeZone: "Unknown/Zone" }, { linkType: "none" },
    { respondentStatus: ["qualified"] }, { respondentSubstatus: ["9999"] },
    { uploadUrl: "https://example.test" }, { includePartialResponses: true },
  ]) assert.equal(createReportSchema.safeParse({ ...body, ...patch }).success, false, JSON.stringify(patch));
});

test("MIR scope validates every subsample at the mutation boundary", async () => {
  const supplierId = "supplier-northstar" as SupplierId;
  const base = (await getReports(supplierId))[0];
  const owned = subsamples.filter(s => s.supplierId === supplierId).slice(0, 2).map(s => s.id);
  const report = await createReport({ ...base, scope: { scopeType: "subsamples", subsampleIds: owned } });
  assert.equal(report.status, "queued");
  for (const ids of [[owned[0], "foreign-or-missing"], [], [owned[0], owned[0]]]) {
    await assert.rejects(createReport({ ...base, scope: { scopeType: "subsamples", subsampleIds: ids } }), /not valid/);
  }
  assert.equal((await createReport({ ...base, scope: { scopeType: "supplier" } })).scope.scopeType, "supplier");
});
