import assert from "node:assert/strict";
import test from "node:test";
import { costSchema } from "../src/lib/repositories/mock/fixture-schemas";
import { costs, projects, reports, subsamples } from "../src/lib/repositories/mock/fixture-store";
import { costsForView, groupCosts } from "../src/features/costs/cost-groups";
import { getCostBreakdown } from "../src/features/costs/cost-breakdown";
import { previewCostAdjustments } from "../src/features/costs/cost-scenarios";
import { recentReportSummary, reportScopeName } from "../src/features/reports/report-presentation";

test("baseline costs cover multiple events and keep every payable record in shared groups", () => {
  const pending = costsForView(costs, "pending");
  const groups = groupCosts(pending, projects, subsamples);
  assert.ok(groups.length >= 10);
  assert.equal(groups.flatMap(group => group.records).length, pending.length);
  assert.ok(groups.some(group => group.subsamples.length > 1));
  assert.ok(groups.some(group => group.projectCosts.length > 0));
  for (const group of groups) {
    for (const breakdown of getCostBreakdown(group.records)) {
      assert.equal(breakdown.total, group.totals.find(total => total.currency === breakdown.currency)?.amount);
    }
  }
});

test("published demo costs never contain zero charges or non-positive event totals", () => {
  assert.ok(costs.every(cost => cost.totalCost !== 0));
  assert.equal(costSchema.safeParse({ ...costs[0], totalCost: 0 }).success, false);
  for (const view of ["pending", "history"] as const) {
    for (const group of groupCosts(costsForView(costs, view), projects, subsamples)) {
      assert.ok(getCostBreakdown(group.records).every(total => total.total > 0));
    }
  }
});

test("baseline Member Info reports cover every status and scope with identifiable shared labels", () => {
  const current = reports.filter(report => report.type === "respondent_info");
  assert.ok(current.length > 10);
  assert.deepEqual(new Set(current.map(report => report.status)), new Set(["queued", "executing", "finished", "error"]));
  assert.deepEqual(new Set(current.map(report => report.scope.scopeType)), new Set(["supplier", "project", "subsample", "subsamples"]));
  const projectMap = new Map(projects.map(project => [project.id, project]));
  const subsampleMap = new Map(subsamples.map(subsample => [subsample.id, subsample]));
  for (const report of current) {
    assert.ok(!["Project", "Subsample"].includes(reportScopeName(report, projectMap, subsampleMap)));
    if (report.status === "finished") assert.ok(report.downloadUrl);
  }
});

test("dense cost preview leaves the ordinary fixtures unchanged", () => {
  const original = structuredClone(costs);
  const preview = previewCostAdjustments(costs, "costs-many");
  assert.equal(preview.length, 200);
  assert.equal(new Set(preview.map(cost => cost.id)).size, 200);
  assert.ok(preview.every(cost => cost.status === "pending_approval"));
  assert.deepEqual(costs, original);
});

test("report titles name unique covered projects and exclude other suppliers", () => {
  const report = reports.find(report => report.type === "respondent_info")!;
  const owned = subsamples.filter(item => item.supplierId === report.supplierId);
  const first = owned[0];
  const second = owned.find(item => item.projectId !== first.projectId)!;
  const projectMap = new Map(projects.map(project => [project.id, project]));
  const subsampleMap = new Map(subsamples.map(subsample => [subsample.id, subsample]));
  const title = reportScopeName({ ...report, scope: { scopeType: "subsamples", subsampleIds: [first.id, first.id, second.id] } }, projectMap, subsampleMap);
  assert.equal(title, `${projectMap.get(first.projectId)!.name} · ${projectMap.get(second.projectId)!.name}`);
  const all = reportScopeName({ ...report, scope: { scopeType: "supplier" } }, projectMap, subsampleMap);
  assert.equal(all, [...new Set(projects.filter(project => project.supplierId === report.supplierId).map(project => project.name))].join(" · "));
});

test("recent report summary hides failures, fills five rows and only flags recent errors", () => {
  const source = reports.filter(report => report.type === "respondent_info");
  const original = structuredClone(source);
  const sorted = [...source].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const summary = recentReportSummary(source);
  assert.equal(summary.visible.length, 5);
  assert.ok(summary.visible.every(report => report.status !== "error"));
  assert.equal(summary.failed, sorted.slice(0, 5).filter(report => report.status === "error").length);
  assert.deepEqual(summary.visible, sorted.filter(report => report.status !== "error").slice(0, 5));
  assert.deepEqual(source, original);
  assert.deepEqual(recentReportSummary([]), { visible: [], failed: 0 });
  const failures = sorted.slice(0, 2).map(report => ({ ...report, status: "error" as const }));
  assert.deepEqual(recentReportSummary(failures), { visible: [], failed: 2 });
  const olderFailure = sorted.map((report, index) => ({ ...report, status: index === sorted.length - 1 ? "error" as const : "finished" as const }));
  assert.equal(recentReportSummary(olderFailure).failed, 0);
});
