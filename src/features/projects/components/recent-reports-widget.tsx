import { ReportErrorDetails } from "@/components/report-error-details";
import { ReportAction } from "./report-action";
import Link from "next/link";
import {
  CircleAlert,
  FileCheck2,
  Hourglass,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Report } from "@/types/report";

const reportTypeLabels: Record<Report["type"], string> = {
  respondent_info: "Respondent Info Report",
  survey_duration: "Survey Duration Report",
  mini_router_quota: "Mini-Router Quota Report",
};

const reportStatusLabels: Record<Report["status"], string> = {
  queued: "Queued",
  executing: "Executing",
  finished: "Finished",
  error: "Error",
};

const reportStatusStyles: Record<Report["status"], string> = {
  queued: "text-slate-600",
  executing: "text-blue-800",
  finished: "text-emerald-800",
  error: "text-rose-800",
};

const reportStatusIcons = {
  queued: Hourglass,
  executing: LoaderCircle,
  finished: FileCheck2,
  error: CircleAlert,
} satisfies Record<Report["status"], typeof Hourglass>;

function formatReportDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RecentReportsWidget({ reports }: { reports: Report[] }) {
  const recentReports = [...reports]
    .sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    )
    .slice(0, 10);

  return (
    <Card className="gap-0 rounded-none border-0 py-0 shadow-none">
      <CardHeader className="gap-1 px-4 pb-1 pt-2">
        <CardTitle>
          <h2 className="text-base font-semibold">Recent Reports</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3 pt-1">
        {recentReports.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-sm font-medium">No reports yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reports you run will appear here.
            </p>
          </div>
        ) : (
          <ul aria-label="Recent Reports">
            {recentReports.map((report, index) => {
              const StatusIcon = reportStatusIcons[report.status];
              return (
                <li key={report.id}>
                  {index > 0 ? <Separator /> : null}
                  <div className="flex gap-2.5 py-2">
                    {report.status === "error" ? (
                      <ReportErrorDetails reportId={report.id} message={report.errorMessage} className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200">
                        <StatusIcon aria-hidden="true" className="size-4" />
                      </ReportErrorDetails>
                    ) : (
                      <ReportAction report={report} label={`${report.status === "finished" ? "Download" : "View in queue:"} ${reportTypeLabels[report.type]} (${report.id})`} className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground hover:bg-accent hover:text-foreground">
                        <StatusIcon aria-hidden="true" className={`size-4 ${report.status === "executing" ? "animate-spin motion-reduce:animate-none" : ""}`} />
                      </ReportAction>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium leading-5">
                        <ReportAction report={report} className={report.status === "error" ? undefined : "underline-offset-4 hover:underline"}>{reportTypeLabels[report.type]}</ReportAction>
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-x-1 text-sm leading-5 text-muted-foreground">
                        <span className={reportStatusStyles[report.status]}>
                          {reportStatusLabels[report.status]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>ID {report.id}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={report.createdAt}>
                          {formatReportDate(report.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <div className="flex items-center gap-2 border-t px-4 py-2.5">
        <Button asChild className="gap-1.5 px-2" size="sm" variant="outline">
          <Link href="/reports"><UserRound aria-hidden="true" className="size-4" />Create New Report</Link>
        </Button>
        <Button asChild size="sm" variant="outline"><Link href="/reports">View All</Link></Button>
      </div>
    </Card>
  );
}
