import { ReportStatusIcon } from "@/features/reports/components/report-status-icon";
import { ReportAction } from "./report-action";
import Link from "next/link";
import {
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentReportSummary, reportScopeName } from "@/features/reports/report-presentation";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";
import type { Report } from "@/types/report";

const reportTypeLabels: Record<Report["type"], string> = {
  respondent_info: "Member Info Report",
  survey_duration: "Survey Duration Report",
  mini_router_quota: "Mini-Router Quota Report",
};

function formatReportDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RecentReportsWidget({ reports, projects, subsamples }: { reports: Report[]; projects: Project[]; subsamples: Subsample[] }) {
  const projectById = new Map(projects.map(project => [project.id, project]));
  const subsampleById = new Map(subsamples.map(subsample => [subsample.id, subsample]));
  const { visible: recentReports, failed } = recentReportSummary(reports);

  return (
    <Card className="gap-0 rounded-none border-0 bg-transparent py-0 shadow-none">
      <CardHeader className="gap-1 px-2 pb-2 pt-2">
        <div className="flex items-center justify-between gap-2">
        <CardTitle>
          <h2 className="text-base font-semibold">Recent Reports</h2>
        </CardTitle>
          <Button asChild size="xs" variant="outline"><Link href="/reports">View All</Link></Button>
        </div>
        {reports.length > 0 && <p className="text-xs text-muted-foreground">Showing {recentReports.length} of {reports.length} reports{failed > 0 && <> - <Link href="/reports" className="font-medium text-destructive underline-offset-4 hover:underline">{failed} Failed</Link></>}</p>}
      </CardHeader>
      <CardContent className="space-y-3 px-2 pb-3 pt-1">
        {recentReports.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-sm font-medium">{reports.length ? "No non-failed reports available" : "No reports yet"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reports you run will appear here.
            </p>
          </div>
        ) : (
          <ul aria-label="Recent Reports" className="space-y-1">
            {recentReports.map((report) => {
              return (
                <li key={report.id} className="rounded-md border border-border/60 bg-white px-2 py-2">
                    <div className="flex gap-2">
                    <ReportStatusIcon report={report} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-5" title={reportScopeName(report, projectById, subsampleById)}>
                        <ReportAction report={report} interactiveClassName="underline-offset-4 hover:text-primary hover:underline">{reportScopeName(report, projectById, subsampleById)}</ReportAction>
                      </p>
                      <p className="text-xs leading-4 text-muted-foreground">{reportTypeLabels[report.type]} · <time dateTime={report.createdAt}>{formatReportDate(report.createdAt)}</time></p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Button asChild className="gap-1 px-2 [&_svg]:size-3" size="xs" variant="outline">
          <Link href="/reports/create"><UserRound aria-hidden="true" className="size-3" />Create New Report</Link>
        </Button>
      </CardContent>

    </Card>
  );
}
