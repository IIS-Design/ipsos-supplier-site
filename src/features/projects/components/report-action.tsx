import Link from "next/link";
import type { ReactNode } from "react";
import type { Report } from "@/types/report";
import { withBasePath } from "@/lib/app-path";

export function ReportAction({ report, children, className, label, onViewQueue }: { report: Report; children: ReactNode; className?: string; label?: string; onViewQueue?: () => void }) {
  if (report.status === "queued" || report.status === "executing") {
    if (onViewQueue) return <button aria-label={label} className={className} onClick={onViewQueue} type="button">{children}</button>;
    return <Link aria-label={label} className={className} href="/reports?view=queue">{children}</Link>;
  }
  if (report.status === "finished" && report.downloadUrl) {
    return <a aria-label={label} className={className} download href={withBasePath(report.downloadUrl)}>{children}</a>;
  }
  return <span className={className}>{children}</span>;
}
