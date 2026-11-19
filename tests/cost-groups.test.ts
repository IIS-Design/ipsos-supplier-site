import assert from "node:assert/strict";
import test from "node:test";
import { costsForView, filterCostGroups, groupCosts } from "../src/features/costs/cost-groups";
import type { Cost } from "../src/types/cost";
import type { Project } from "../src/types/project";
import type { Subsample } from "../src/types/subsample";

const project = { id: "p1", supplierId: "supplier", surveyEventId: "S123", name: "Tracker", status: "live" } as Project;
const subsamples = [
  { id: "s1", supplierId: "supplier", projectId: "p1", country: "Canada", name: "Parents", jobBookNumber: "J123" },
  { id: "s2", supplierId: "supplier", projectId: "p1", country: "United States", name: "General population" },
  { id: "s3", supplierId: "supplier", projectId: "p1", country: "Canada", name: "No entries" },
] as Subsample[];
function cost(id: string, scope: Cost["scope"], overrides: Partial<Cost> = {}): Cost {
  return {
    id, supplierId: "supplier", scope, completes: 10, cpi: 3, totalCost: 30, currency: "USD",
    status: "pending_approval", country: "Canada", supplierProjectId: "SUP-42", billingMode: "survey_level", apiEnabled: true,
    ...overrides,
  } as Cost;
}
const records = [
  cost("c1", { scopeType: "subsample", subsampleId: "s1" } as Cost["scope"]),
  cost("c2", { scopeType: "subsample", subsampleId: "s1" } as Cost["scope"], { cpi: 4, totalCost: 40 }),
  cost("c3", { scopeType: "subsample", subsampleId: "s2" } as Cost["scope"], { country: "United States", totalCost: 20, currency: "EUR" }),
  cost("fees", { scopeType: "project", projectId: "p1" } as Cost["scope"], { totalCost: 5 }),
];

test("groups all CPI entries and project charges once, with separate currency totals", () => {
  const snapshot = JSON.stringify({ records, subsamples });
  const groups = groupCosts(records, [project], subsamples);
  assert.equal(groups.length, 1);
  const [group] = groups;
  assert.deepEqual(group.records.map((record) => record.id), ["c1", "c2", "c3", "fees"]);
  assert.deepEqual(group.subsamples.map((child) => child.records.length), [2, 1]);
  assert.deepEqual(group.projectCosts.map((record) => record.id), ["fees"]);
  assert.deepEqual(group.totals, [{ currency: "USD", amount: 75 }, { currency: "EUR", amount: 20 }]);
  assert.equal(JSON.stringify({ records, subsamples }), snapshot);
});

test("country, subsample and job book filters retain the whole event and every charge", () => {
  const groups = groupCosts(records, [project], subsamples);
  for (const filter of [{ country: "United States" }, { search: "Parents" }, { search: "J123" }, { search: "S123" }]) {
    const [match] = filterCostGroups(groups, filter);
    assert.strictEqual(match, groups[0]);
    assert.equal(match.records.length, 4);
    assert.equal(match.subsamples.length, 2);
  }
  assert.deepEqual(filterCostGroups(groups, { search: "missing" }), []);
});

test("unresolved subsamples and projects keep all costs without merging unrelated orphans", () => {
  const orphanRecords = [
    cost("unknown1", { scopeType: "subsample", subsampleId: "missing1" } as Cost["scope"]),
    cost("unknown2", { scopeType: "subsample", subsampleId: "missing2" } as Cost["scope"]),
    cost("unknown-project", { scopeType: "project", projectId: "missing-project" } as Cost["scope"]),
  ];
  const groups = groupCosts(orphanRecords, [], []);
  assert.equal(groups.length, 3);
  assert.equal(groups[0].subsamples[0].id, "missing1");
  assert.deepEqual(groups.flatMap((group) => group.records), orphanRecords);
});

test("pending and history preserve individual record statuses and date filters retain siblings", () => {
  const approved = cost("approved", records[0].scope, { status: "approved", approval: { status: "approved", decidedAt: "2026-11-10T10:00:00Z", decidedByUserId: "user" } as Cost["approval"] });
  const rejected = cost("rejected", records[1].scope, { status: "rejected", publishedAt: "2026-10-05T10:00:00Z" });
  assert.equal(costsForView([...records, approved, rejected], "pending").length, 4);
  assert.deepEqual(costsForView([...records, approved, rejected], "history").map((record) => record.status), ["approved", "rejected"]);
  const groups = groupCosts([approved, rejected], [project], subsamples);
  assert.equal(filterCostGroups(groups, { status: "approved", dateFrom: "2026-11-01", dateTo: "2026-11-30" })[0].records.length, 2);
  assert.deepEqual(filterCostGroups(groups, { dateFrom: "2026-12-01", dateTo: "2026-11-01" }), []);
});

test("same internal project ID across suppliers does not combine payable amounts", () => {
  const other = cost("other", records[0].scope, { supplierId: "other-supplier" } as Partial<Cost>);
  const groups = groupCosts([records[0], other], [project], subsamples);
  assert.equal(groups.length, 2);
  assert.notEqual(groups[0].id, groups[1].id);
  assert.equal(groups[1].project, undefined);
});

test("fixture refresh replaces stale currency without resetting saved approval decisions", async () => {
  const { refreshCostFixtures } = await import("../src/lib/repositories/mock/refresh-cost-fixtures");
  const fixture = cost("refresh", records[0].scope, { currency: "USD", totalCost: 297.6 });
  const approval = { status: "approved", decidedAt: "2026-11-19T10:00:00Z", decidedByUserId: "user" } as Cost["approval"];
  const current = [{ ...fixture, currency: "EUR", status: "approved", approval } as Cost];
  refreshCostFixtures(current, [fixture]);
  assert.equal(current[0].currency, "USD");
  assert.equal(current[0].totalCost, 297.6);
  assert.equal(current[0].status, "approved");
  assert.deepEqual(current[0].approval, approval);
  assert.equal(fixture.status, "pending_approval");
});

test("restoring available demo costs resets decisions only for the supplier's original pending entries", async () => {
  const { restorePendingCostFixtures } = await import("../src/lib/repositories/mock/refresh-cost-fixtures");
  const fixture = cost("restore", records[0].scope);
  const history = cost("history", records[0].scope, { status: "approved" });
  const other = cost("other", records[0].scope, { supplierId: "another" } as Partial<Cost>);
  const current = [{ ...fixture, status: "approved", approval: { note: "demo approval" } } as Cost, history, other];
  assert.equal(restorePendingCostFixtures(current, [fixture, history, other], "supplier"), 1);
  assert.equal(current[0].status, "pending_approval");
  assert.equal(current[0].approval, undefined);
  assert.strictEqual(current[1], history);
  assert.strictEqual(current[2], other);
  restorePendingCostFixtures(current, [fixture, history, other], "supplier");
  assert.equal(current.length, 3);
});

test("all cost fixtures supply valid incidence and LOI and include optional-fee examples", async () => {
  const { default: fixtures } = await import("../src/data/costs.json");
  assert.ok(fixtures.length > 0);
  for (const cost of fixtures) {
    assert.equal(typeof cost.incidence, "number");
    assert.ok(cost.incidence >= 3 && cost.incidence <= 90);
    assert.equal(typeof cost.loi, "number");
    assert.ok(cost.loi >= 3 && cost.loi <= 45);
  }
  assert.ok(fixtures.some(cost => "minimumFee" in cost));
  assert.ok(fixtures.some(cost => "otherFees" in cost));
  assert.ok(fixtures.some(cost => !("minimumFee" in cost) && !("otherFees" in cost)));
});

test("adjustment scenarios recompute preview totals without changing metrics, decisions or source records", async () => {
  const { previewCostAdjustments } = await import("../src/features/costs/cost-scenarios");
  const source = [cost("project-preview", { scopeType: "project", projectId: "p1" } as Cost["scope"], { incidence: 45, loi: 10 })];
  const original = structuredClone(source);
  const withFees = previewCostAdjustments(source, "costs-with-adjustments");
  const withoutFees = previewCostAdjustments(withFees, "costs-without-adjustments");
  assert.ok(withFees[0].minimumFee);
  assert.ok(withFees[0].otherFees);
  assert.ok(withFees[0].discountAmount);
  assert.equal(withoutFees[0].minimumFee, undefined);
  assert.equal(withoutFees[0].otherFees, undefined);
  assert.equal(withoutFees[0].discountAmount, undefined);
  for (const preview of [withFees, withoutFees]) {
    assert.equal(preview[0].totalCost, 30 + (preview[0].minimumFee ?? 0) + (preview[0].otherFees ?? 0) - (preview[0].discountAmount ?? 0));
    assert.equal(preview[0].status, source[0].status);
    assert.equal(preview[0].incidence, 45);
    assert.equal(preview[0].loi, 10);
  }
  assert.deepEqual(source, original);
});

test("only subsamples with cost entries in the current view are included", () => {
  const pending = records[0];
  const approved = cost("history-only", records[2].scope, { status: "approved" });
  const [pendingGroup] = groupCosts(costsForView([pending, approved], "pending"), [project], subsamples);
  assert.deepEqual(pendingGroup.subsamples.map(item => item.id), ["s1"]);
  assert.ok(pendingGroup.subsamples.every(item => item.records.length > 0));
  const [projectOnly] = groupCosts([records[3]], [project], subsamples);
  assert.deepEqual(projectOnly.subsamples, []);
  assert.deepEqual(projectOnly.jobBookNumbers, ["J123"]);
});

test("every published cost example has a publication date and every project has a billing entity", async () => {
  const { default: costs } = await import("../src/data/costs.json");
  const { default: projects } = await import("../src/data/projects.json");
  assert.ok(costs.every(cost => cost.publishedAt && Number.isFinite(Date.parse(cost.publishedAt))));
  assert.ok(projects.every(project => project.billingEntity?.trim()));
  assert.ok(projects.every(project =>
    project.deviceCompatibility &&
    typeof project.deviceCompatibility.mobile === "boolean" &&
    typeof project.deviceCompatibility.tablet === "boolean" &&
    typeof project.deviceCompatibility.desktop === "boolean"
  ));
});

test("weighted project CPI includes every subsample and fees are counted once", async () => {
  const { getCostBreakdown } = await import("../src/features/costs/cost-breakdown");
  const items = [
    cost("a", records[0].scope, { completes: 35, cpi: 5, totalCost: 175 }),
    cost("b", records[1].scope, { completes: 28, cpi: 5.25, totalCost: 147 }),
    cost("fees", records[3].scope, { completes: 0, cpi: 0, sampleCost: 0, minimumFee: 100, discountAmount: 12.4, totalCost: 87.6 }),
  ];
  const [result] = getCostBreakdown(items);
  assert.equal(result.completes, 63);
  assert.equal(result.sample, 322);
  assert.equal(result.averageCpi, 322 / 63);
  assert.equal(result.total, 409.6);
  assert.equal(getCostBreakdown([cost("zero", records[3].scope, { completes: 0, cpi: 0, sampleCost: 0, totalCost: 0 })])[0].averageCpi, null);
});

test("every demo cost breakdown reconciles to its stored event total and has complete subsample metadata", async () => {
  const { getCostBreakdown } = await import("../src/features/costs/cost-breakdown");
  const { default: costs } = await import("../src/data/costs.json");
  const { default: projects } = await import("../src/data/projects.json");
  const { default: subsamples } = await import("../src/data/subsamples.json");
  for (const group of groupCosts(costs as Cost[], projects as Project[], subsamples as Subsample[])) {
    for (const component of getCostBreakdown(group.records)) {
      const stored = group.totals.find(total => total.currency === component.currency)!;
      assert.ok(Math.abs(component.total - stored.amount) < 0.00001);
    }
  }
  assert.ok(subsamples.every(subsample => subsample.sampleType && Number.isFinite(Date.parse(subsample.lastStatusUpdatedAt))));
});

test("sample composition sums final subsample amounts rather than recalculating CPI or subtracting discounts twice", async () => {
  const { getCostBreakdown } = await import("../src/features/costs/cost-breakdown");
  const finalEntries = [
    cost("final-a", records[0].scope, { completes: 10, cpi: 5, totalCost: 45, discountAmount: 5 }),
    cost("final-b", records[1].scope, { completes: 20, cpi: 4, totalCost: 79.95 }),
    cost("project-adjustment", records[3].scope, { completes: 0, cpi: 0, sampleCost: 0, totalCost: 8, otherFees: 10, discountAmount: 2 }),
  ];
  const [breakdown] = getCostBreakdown(finalEntries);
  assert.equal(breakdown.sample, 124.95);
  assert.equal(breakdown.averageCpi, 124.95 / 30);
  assert.equal(breakdown.discount, 2);
  assert.equal(breakdown.total, 132.95);
});

test("every pending fixture event has at least one pending subsample with reconciled totals", async () => {
  const { default: costFixtures } = await import("../src/data/costs.json");
  const { default: projectFixtures } = await import("../src/data/projects.json");
  const { default: subsampleFixtures } = await import("../src/data/subsamples.json");
  const groups = groupCosts(costsForView(costFixtures as unknown as Cost[], "pending"), projectFixtures as unknown as Project[], subsampleFixtures as unknown as Subsample[]);
  assert.ok(groups.every(group => group.subsamples.length > 0));
  assert.ok(groups.every(group => group.subsamples.every(child => child.records.length > 0)));
  const totals = new Map(groups.map(group => [group.projectId, group.totals]));
  assert.deepEqual(totals.get("project-1100004"), [{ currency: "EUR", amount: 4466.6 }]);
  assert.deepEqual(totals.get("project-1100003"), [{ currency: "EUR", amount: 1859.6 }]);
});
