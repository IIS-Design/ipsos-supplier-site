import Link from "next/link";
import type { ReactNode } from "react";
import type { Report } from "@/types/report";

export function ReportAction({ report, children, className, label }: { report: Report; children: ReactNode; className?: string; label?: string }) {
  if (report.status === "queued" || report.status === "executing") {
    return <Link aria-label={label} className={className} href="/reports?view=queue">{children}</Link>;
  }
  if (report.status === "finished" && report.downloadUrl) {
    return <a aria-label={label} className={className} download href={report.downloadUrl}>{children}</a>;
  }
  return <span className={className}>{children}</span>;
}
