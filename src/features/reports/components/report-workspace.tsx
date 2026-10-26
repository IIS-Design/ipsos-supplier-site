"use client";

import { ReportErrorDetails } from "@/components/report-error-details";
import { withBasePath } from "@/lib/app-path";

import Link from "next/link";
import { PrototypeEmptyNotice, usePrototypeState } from "@/components/prototype-state";
import { useMemo, useState } from "react";
import {
  CircleAlert,
  FileCheck2,
  Hourglass,
  LoaderCircle,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/types/project";
import type { Report, ReportType } from "@/types/report";
import type { Subsample } from "@/types/subsample";

const reportTypeLabels: Record<ReportType, string> = {
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

const statusStyles: Record<Report["status"], string> = {
  queued: "text-slate-600",
  executing: "text-blue-800",
  finished: "text-emerald-800",
  error: "text-rose-800",
};

const statusIcons = {
  queued: Hourglass,
  executing: LoaderCircle,
  finished: FileCheck2,
  error: CircleAlert,
} satisfies Record<Report["status"], typeof Hourglass>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function reportScopeName(
  report: Report,
  projects: Map<string, Project>,
  subsamples: Map<string, Subsample>,
) {
  return report.scope.scopeType === "project"
    ? (projects.get(report.scope.projectId)?.name ?? "Project")
    : (subsamples.get(report.scope.subsampleId)?.name ?? "Subsample");
}

function ReportList({
  reports,
  projects,
  subsamples,
  emptyMessage,
}: {
  reports: Report[];
  projects: Project[];
  subsamples: Subsample[];
  emptyMessage: string;
}) {
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const subsampleById = new Map(
    subsamples.map((subsample) => [subsample.id, subsample]),
  );

  if (reports.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul aria-label="Reports" className="divide-y">
      {reports.map((report) => {
        const StatusIcon = statusIcons[report.status];
        return (
          <li className="flex gap-3 py-3" key={report.id}>
            {report.status === "error" ? <ReportErrorDetails reportId={report.id} message={report.errorMessage} className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200"><StatusIcon aria-hidden="true" className="size-4" /></ReportErrorDetails> : (
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"
            >
              <StatusIcon
                className={`size-4 ${report.status === "executing" ? "animate-spin motion-reduce:animate-none" : ""}`}
              />
            </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-medium leading-5">{reportTypeLabels[report.type]}</p>
                <Badge
                  className={`text-sm ${statusStyles[report.status]}`}
                  variant="outline"
                >
                  {reportStatusLabels[report.status]}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {reportScopeName(report, projectById, subsampleById)}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                ID {report.id} · {formatDate(report.createdAt)}
              </p>
              {report.status === "finished" && report.downloadUrl ? (
                <a
                  className="mt-1 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                  href={withBasePath(report.downloadUrl)}
                  download
                >
                  Download report
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ReportWorkspace({
  reports: sourceReports,
  projects,
  subsamples,
  initialView = "history",
  createdReportId,
}: {
  reports: Report[];
  projects: Project[];
  subsamples: Subsample[];
  initialView?: "history" | "queue";
  createdReportId?: string;
}) {
  const [view, setView] = useState<"history" | "queue">(initialView);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("3m");
  const { empty } = usePrototypeState();
  const reports = useMemo(() => empty ? [] : sourceReports, [empty, sourceReports]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    [reports],
  );
  const matchesFilters = (report: Report) => {
    if (statusFilter !== "all" && report.status !== statusFilter) return false;
    if (dateFilter === "3m") {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 3);
      if (Date.parse(report.createdAt) < cutoff.getTime()) return false;
    }
    if (!normalizedQuery) return true;
    const project =
      report.scope.scopeType === "project"
        ? projects.find((item) => item.id === report.scope.projectId)
        : undefined;
    const subsample =
      report.scope.scopeType === "subsample"
        ? subsamples.find((item) => item.id === report.scope.subsampleId)
        : undefined;
    return [
      reportTypeLabels[report.type],
      report.id,
      project?.name,
      subsample?.name,
      reportStatusLabels[report.status],
    ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
  };
  const history = sortedReports.filter(matchesFilters);
  const queue = sortedReports
    .filter(
      (report) => report.status === "queued" || report.status === "executing",
    )
    .filter(matchesFilters);
  const queuedCount = reports.filter(
    (report) => report.status === "queued",
  ).length;
  const executingCount = reports.filter(
    (report) => report.status === "executing",
  ).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and monitor operational reports.
          </p>
        </div>
        <Button asChild>
          <Link href="/reports/create">
            <Plus aria-hidden="true" className="size-4" />
            Create Report
          </Link>
        </Button>
      </header>

      <PrototypeEmptyNotice module="Reports" />

      {createdReportId && !empty ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
          role="status"
        >
          Report {createdReportId} was successfully queued. You can find it in
          Report Queue.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          ["respondent_info", "survey_duration", "mini_router_quota"] as const
        ).map((type) => (
          <Card className="gap-3 py-4" key={type}>
            <CardHeader className="px-4">
              <CardTitle>
                <h2 className="text-base font-medium leading-5">
                  {reportTypeLabels[type]}
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <Button asChild className="w-full" size="sm" variant="outline">
                <Link href={`/reports/create?type=${type}`}>Create Report</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>
                <h2 className="text-lg font-semibold">Report Activity</h2>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Recent reports, execution progress, and completed downloads.
              </p>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>{queuedCount} queued</span>
              <span aria-hidden="true">·</span>
              <span>{executingCount} executing</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(180px,1fr)_180px_180px]">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search reports by survey"
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by Survey ID or name..."
                value={query}
              />
            </div>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger aria-label="Filter reports by status">
                <SelectValue placeholder="Show All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show All</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="executing">Executing</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setDateFilter} value={dateFilter}>
              <SelectTrigger aria-label="Filter reports by date">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Tabs
            value={view}
            onValueChange={(value) => setView(value as "history" | "queue")}
          >
            <TabsList aria-label="Report views">
              <TabsTrigger value="history">Report History</TabsTrigger>
              <TabsTrigger value="queue">
                Report Queue ({queuedCount + executingCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-3">
              <ReportList
                emptyMessage={
                  !empty && normalizedQuery
                    ? "No reports match your search."
                    : "No reports have been created yet."
                }
                projects={projects}
                reports={history}
                subsamples={subsamples}
              />
            </TabsContent>
            <TabsContent value="queue" className="mt-3">
              <ReportList
                emptyMessage={
                  !empty && normalizedQuery
                    ? "No queued or executing reports match your search."
                    : "There are no reports in the queue."
                }
                projects={projects}
                reports={queue}
                subsamples={subsamples}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Separator />
    </div>
  );
}
