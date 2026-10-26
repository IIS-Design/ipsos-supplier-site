import { PrototypeActivityPreview } from "@/components/prototype-state";
import { ProjectsWorkspace } from "@/features/projects/components/activity-panel";
import { ProjectsExplorer } from "@/features/projects/components/projects-explorer";
import { PendingCostApprovalsWidget } from "@/features/projects/components/pending-cost-approvals-widget";
import { RecentReportsWidget } from "@/features/projects/components/recent-reports-widget";
import { getCurrentUser } from "@/lib/auth/session";
import { getCosts } from "@/services/cost-service";
import { getProjects } from "@/services/project-service";
import { getReports } from "@/services/report-service";
import { getSubsamples } from "@/services/subsample-service";

export default async function ProjectsRoute() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error(
      "Authenticated user session was unavailable while loading projects.",
    );
  }

  const [projects, subsamples, reports, costs] = await Promise.all([
    getProjects(user.supplierId),
    getSubsamples(user.supplierId),
    getReports(user.supplierId),
    getCosts(user.supplierId),
  ]);

  return (
    <ProjectsWorkspace
      reports={<PrototypeActivityPreview module="Reports" emptyContent={<RecentReportsWidget reports={[]} />}><RecentReportsWidget reports={reports} /></PrototypeActivityPreview>}
      costs={<PrototypeActivityPreview module="Costs" emptyContent={<PendingCostApprovalsWidget costs={[]} projects={projects} subsamples={subsamples} />}><PendingCostApprovalsWidget costs={costs} projects={projects} subsamples={subsamples} /></PrototypeActivityPreview>}
    >
      <ProjectsExplorer projects={projects} subsamples={subsamples} />
    </ProjectsWorkspace>
  );
}
