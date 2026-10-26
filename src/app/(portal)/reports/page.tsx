import { notFound } from "next/navigation";
import { ReportWorkspace } from "@/features/reports/components/report-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { getProjects } from "@/services/project-service";
import { getReports } from "@/services/report-service";
import { getSubsamples } from "@/services/subsample-service";

export default async function ReportsRoute({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; created?: string }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) notFound();
  const [reports, projects, subsamples] = await Promise.all([
    getReports(user.supplierId),
    getProjects(user.supplierId),
    getSubsamples(user.supplierId),
  ]);

  return (
    <ReportWorkspace
      initialView={query.view === "queue" ? "queue" : "history"}
      createdReportId={
        reports.some((report) => report.id === query.created)
          ? query.created
          : undefined
      }
      projects={projects}
      reports={reports}
      subsamples={subsamples}
    />
  );
}
