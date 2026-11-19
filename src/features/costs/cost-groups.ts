import { formatSubsampleId } from "@/lib/subsample-id";
import type { Cost } from "@/types/cost";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";

export type CostSubsampleGroup = {
  id: string;
  subsample?: Subsample;
  records: Cost[];
};

export type CostGroup = {
  id: string;
  projectId?: string;
  project?: Project;
  records: Cost[];
  projectCosts: Cost[];
  jobBookNumbers: string[];
  subsamples: CostSubsampleGroup[];
  totals: { currency: string; amount: number }[];
};

/** Preserve the supplied payable amounts; different currencies never share a total. */
export function getCostTotals(records: readonly Cost[]) {
  const totals = new Map<string, number>();
  for (const cost of records) {
    totals.set(cost.currency, (totals.get(cost.currency) ?? 0) + cost.totalCost);
  }
  return [...totals].map(([currency, amount]) => ({
    currency,
    amount: Math.round((amount + Number.EPSILON) * 100) / 100,
  }));
}

/** Group every cost once, including unresolved references, without changing source records. */
export function groupCosts(
  costs: readonly Cost[],
  projects: readonly Project[],
  subsamples: readonly Subsample[],
): CostGroup[] {
  const projectMap = new Map(projects.map((project) => [`${project.supplierId}:${project.id}`, project]));
  const subsampleMap = new Map(subsamples.map((subsample) => [`${subsample.supplierId}:${subsample.id}`, subsample]));
  const groups = new Map<string, CostGroup>();

  for (const cost of costs) {
    const subsample = cost.scope.scopeType === "subsample"
      ? subsampleMap.get(`${cost.supplierId}:${cost.scope.subsampleId}`)
      : undefined;
    const projectId = cost.scope.scopeType === "project" ? cost.scope.projectId : subsample?.projectId;
    const id = projectId
      ? `${cost.supplierId}:project:${projectId}`
      : `${cost.supplierId}:subsample:${cost.scope.subsampleId}`;
    let group = groups.get(id);
    if (!group) {
      group = {
        id,
        projectId,
        project: projectId ? projectMap.get(`${cost.supplierId}:${projectId}`) : undefined,
        records: [],
        projectCosts: [],
        jobBookNumbers: [...new Set(subsamples
          .filter(item => item.projectId === projectId && item.supplierId === cost.supplierId)
          .flatMap(item => item.jobBookNumber ? [item.jobBookNumber] : []))],
        subsamples: [],
        totals: [],
      };
      groups.set(id, group);
    }
    group.records.push(cost);
    if (cost.scope.scopeType === "project") {
      group.projectCosts.push(cost);
    } else {
      const subsampleId = cost.scope.subsampleId;
      let child = group.subsamples.find((item) => item.id === subsampleId);
      if (!child) {
        child = { id: subsampleId, subsample, records: [] };
        group.subsamples.push(child);
      }
      child.records.push(cost);
    }
  }

  return [...groups.values()].map((group) => ({ ...group, totals: getCostTotals(group.records) }));
}

export function costsForView(costs: readonly Cost[], view: "pending" | "history") {
  return costs.filter((cost) => view === "pending"
    ? cost.status === "pending_approval"
    : cost.status !== "pending_approval");
}

export type CostGroupFilters = {
  search?: string;
  country?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

/** Filtering finds events, never a partial set of their payable costs. */
export function filterCostGroups(groups: readonly CostGroup[], filters: CostGroupFilters): CostGroup[] {
  const query = filters.search?.trim().toLocaleLowerCase();
  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) return [];
  return groups.filter((group) => {
    if (filters.country && filters.country !== "all" && !group.records.some((cost) => cost.country === filters.country)
      && !group.subsamples.some((child) => child.subsample?.country === filters.country)) return false;
    if (filters.status && filters.status !== "all" && !group.records.some((cost) => cost.status === filters.status)) return false;
    if ((filters.dateFrom || filters.dateTo) && !group.records.some((cost) => {
      const date = (cost.approval?.decidedAt ?? cost.publishedAt)?.slice(0, 10);
      return date && (!filters.dateFrom || date >= filters.dateFrom) && (!filters.dateTo || date <= filters.dateTo);
    })) return false;
    if (!query) return true;
    const fields = [
      group.projectId, group.project?.name, group.project?.surveyEventId, group.project?.billingEntity, ...group.jobBookNumbers,
      ...group.records.flatMap((cost) => [cost.id, cost.country, cost.supplierProjectId]),
      ...group.subsamples.flatMap((child) => [child.id, child.subsample ? formatSubsampleId(child.subsample) : formatSubsampleId(child.id), child.subsample?.name, child.subsample?.country, child.subsample?.jobBookNumber]),
    ];
    return fields.some((field) => field?.toLocaleLowerCase().includes(query));
  });
}
