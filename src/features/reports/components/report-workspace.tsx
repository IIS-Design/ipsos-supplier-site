"use client";

import { reportScopeName } from "../report-presentation";

import { formatSubsampleId } from "@/lib/subsample-id";

import { ReportAction } from "@/features/projects/components/report-action";
import { ReportStatusIcon } from "./report-status-icon";
import { withBasePath } from "@/lib/app-path";

import Link from "next/link";
import { usePrototypeState } from "@/components/prototype-state";
import { useMemo, useState } from "react";
import {
  Download,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/types/project";
import type { Report, ReportType } from "@/types/report";
import type { Subsample } from "@/types/subsample";

const reportTypeLabels: Record<ReportType, string> = {
  respondent_info: "Member Info Report",
  survey_duration: "Survey Duration Report",
  mini_router_quota: "Mini-Router Quota Report",
};

const reportStatusLabels: Record<Report["status"], string> = {
  queued: "Queued",
  executing: "Executing",
  finished: "Finished",
  error: "Error",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
        return (
          <li id={`report-${report.id}`} className="flex scroll-mt-24 items-center gap-2 py-2" key={report.id}>
            <ReportStatusIcon report={report} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 sm:flex-1">
                  <p className="truncate font-medium leading-5" title={reportScopeName(report, projectById, subsampleById)}>
                    <ReportAction report={report} className="text-left" interactiveClassName="underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" label={`Download Report: ${reportScopeName(report, projectById, subsampleById)} (${report.id})`}>{reportScopeName(report, projectById, subsampleById)}</ReportAction>
                  </p>
                  <p className="text-xs leading-4 text-muted-foreground">{reportTypeLabels[report.type]} · <time dateTime={report.createdAt}>{formatDate(report.createdAt)}</time></p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground sm:whitespace-nowrap">
                  ID <span className="text-foreground">{report.id}</span>
                </p>
              </div>
              {report.status === "finished" && !report.downloadUrl && <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"><p className="font-medium">File no longer available</p><p className="text-muted-foreground">Create a new report to download an updated file.</p><Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs"><Link href="/reports/create">Create report</Link></Button></div>}
            </div>
            {report.status === "finished" && report.downloadUrl ? (
              <Button asChild size="sm" variant="outline" className="h-7 shrink-0 gap-1.5 self-center px-2 text-xs">
                <a href={withBasePath(report.downloadUrl)} download>
                  <Download aria-hidden="true" className="size-3.5" />Download
                </a>
              </Button>
            ) : null}

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
  createdReportId,
}: {
  reports: Report[];
  projects: Project[];
  subsamples: Subsample[];
  createdReportId?: string;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dates, setDates] = useState(() => {
    const now = new Date();
    const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { from: format(new Date(now.getFullYear(), now.getMonth() - 3, 1)), to: format(now) };
  });
  const { scenario } = usePrototypeState();
  const empty = scenario === "reports-empty";
  const reports = useMemo(() => {
    if (empty) return [];
    if (!scenario.startsWith("reports-") || !sourceReports.length) return sourceReports;
    if (scenario === "reports-many") return Array.from({ length: 120 }, (_, index) => ({ ...sourceReports[index % sourceReports.length], id: `RPT-PREVIEW-${index + 1}` as Report["id"], createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12).toISOString() }));
    const statuses: Report["status"][] = scenario === "reports-unavailable" ? ["finished"] : scenario === "reports-duplicate" ? ["queued"] : scenario === "reports-all" ? ["queued", "executing", "finished", "error"] : [scenario.slice(8) as Report["status"]];
    const now = new Date();
    const createdAt = new Date(now.getFullYear(), now.getMonth() - 1, 15, 12).toISOString();
    return statuses.map((status, index) => ({ ...sourceReports[0], id: `RPT-PREVIEW-${index + 1}` as Report["id"], type: "respondent_info" as const, status, createdAt, downloadUrl: status === "finished" && scenario !== "reports-unavailable" ? "/mock-reports/RPT-2026-1045.csv" : undefined, errorMessage: status === "error" ? "The report could not be generated. Please try again." : undefined }));
  }, [empty, scenario, sourceReports]);
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
    const createdDate = report.createdAt.slice(0, 10);
    if (dates.from && createdDate < dates.from) return false;
    if (dates.to && createdDate > dates.to) return false;
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
      reportScopeName(report, new Map(projects.map(p => [p.id, p])), new Map(subsamples.map(s => [s.id, s]))),
      ...(report.scope.scopeType === "subsamples" ? report.scope.subsampleIds.flatMap(id => [id, formatSubsampleId(subsamples.find(s => s.id === id) ?? id), subsamples.find(s => s.id === id)?.name]) : []),
      project?.name,
      subsample?.name,
      subsample ? formatSubsampleId(subsample) : undefined,
      reportStatusLabels[report.status],
    ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
  };
  const history = sortedReports.filter(matchesFilters);
  const queuedCount = reports.filter(
    (report) => report.status === "queued",
  ).length;
  const executingCount = reports.filter(
    (report) => report.status === "executing",
  ).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

          </div>
        </div>
        <Button asChild>
          <Link href="/reports/create">
            <Plus aria-hidden="true" className="size-4" />
            Create Report
          </Link>
        </Button>
      </header>

      {createdReportId && !empty ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
          role="status"
        >
          Report {createdReportId} was successfully queued. Track its status in the list below.
        </p>
      ) : null}

      <section aria-labelledby="report-activity-heading" className="space-y-4">
        <header>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" id="report-activity-heading">Report Activity</h2>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>{queuedCount} queued</span>
              <span aria-hidden="true">·</span>
              <span>{executingCount} executing</span>
            </div>
          </div>
        </header>
        <div>
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
                placeholder="Search by Subsample ID or name..."
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
            <DateRangePicker label="Filter reports by creation date" initialPresetLabel="Last 3 Months" value={dates} onChange={setDates} />
          </div>
            <ReportList
              emptyMessage="No reports are available for the selected filters."
              projects={projects}
              reports={history}
              subsamples={subsamples}
            />
        </div>
      </section>
    </div>
  );
}
