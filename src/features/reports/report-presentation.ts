import type { Report } from "@/types/report";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";

/** The alert covers the latest five requests; older failures remain in Reports. */
export function recentReportSummary(reports: readonly Report[]) {
  const sorted = [...reports].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return {
    visible: sorted.filter(report => report.status !== "error").slice(0, 5),
    failed: sorted.slice(0, 5).filter(report => report.status === "error").length,
  };
}

/** Name every covered project rather than presenting aggregate scope counts as titles. */
export function reportScopeName(
  report: Report,
  projects: Map<string, Project>,
  subsamples: Map<string, Subsample>,
) {
  const scope = report.scope;
  const projectName = (id?: string) => {
    const project = id ? projects.get(id) : undefined;
    return project?.supplierId === report.supplierId ? project.name : "Unavailable project";
  };
  if (scope.scopeType === "supplier") {
    const names = [...projects.values()].filter(project => project.supplierId === report.supplierId).map(project => project.name);
    return [...new Set(names)].join(" · ") || "Unavailable project";
  }
  if (scope.scopeType === "project") return projectName(scope.projectId);
  const ids = scope.scopeType === "subsamples" ? scope.subsampleIds : [scope.subsampleId];
  return [...new Set(ids.map(id => {
    const subsample = subsamples.get(id);
    return projectName(subsample?.supplierId === report.supplierId ? subsample.projectId : undefined);
  }))].join(" · ") || "Unavailable project";
}
