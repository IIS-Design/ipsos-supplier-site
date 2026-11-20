"use client";

import type { ReactNode } from "react";
import { Tooltip } from "radix-ui";
import type { Report } from "@/types/report";
import { withBasePath } from "@/lib/app-path";
import { cn } from "@/lib/utils";

export function ReportAction({ report, children, className, interactiveClassName, label, tooltip = "Download Report" }: { report: Report; children: ReactNode; className?: string; interactiveClassName?: string; label?: string; tooltip?: string }) {
  if (report.status !== "finished" || !report.downloadUrl) return <span className={className}>{children}</span>;
  return <Tooltip.Provider delayDuration={300}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <a aria-label={label} className={cn(className, interactiveClassName)} download href={withBasePath(report.downloadUrl)}>{children}</a>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="top" sideOffset={6} className="z-90 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">
          {tooltip}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>;
}
