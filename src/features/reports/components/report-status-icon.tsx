"use client";

import { CircleAlert, FileCheck2, Hourglass, LoaderCircle } from "lucide-react";
import { Tooltip } from "radix-ui";
import { ReportErrorDetails } from "@/components/report-error-details";
import { ReportAction } from "@/features/projects/components/report-action";
import type { Report } from "@/types/report";

const icons = { queued: Hourglass, executing: LoaderCircle, finished: FileCheck2, error: CircleAlert };
const colors = {
  queued: "border-slate-200 bg-slate-50 text-slate-600",
  executing: "border-blue-200 bg-blue-50 text-blue-800",
  finished: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

export function ReportStatusIcon({ report }: { report: Report }) {
  const Icon = icons[report.status];
  const className = `grid size-8 shrink-0 place-items-center rounded-md border ${colors[report.status]} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`;
  const icon = <Icon aria-hidden="true" className={`size-4 ${report.status === "executing" ? "animate-spin motion-reduce:animate-none" : ""}`} />;
  if (report.status === "error") return <ReportErrorDetails reportId={report.id} message={report.errorMessage} className={className}>{icon}</ReportErrorDetails>;
  if (report.status === "finished" && report.downloadUrl) return <ReportAction report={report} label={`Finished: Download Report (${report.id})`} tooltip="Finished · Download Report" className={className} interactiveClassName="hover:bg-emerald-100">{icon}</ReportAction>;
  const description = report.status === "queued" ? "Queued · Waiting to be processed" : report.status === "executing" ? "Executing · Report is being generated" : "Finished · File no longer available";
  return <Tooltip.Provider delayDuration={300}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild><span tabIndex={0} aria-label={description} className={className}>{icon}</span></Tooltip.Trigger>
      <Tooltip.Portal><Tooltip.Content side="top" sideOffset={6} className="z-90 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">{description}<Tooltip.Arrow className="fill-foreground" /></Tooltip.Content></Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>;
}
