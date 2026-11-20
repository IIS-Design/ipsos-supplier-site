import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { statusBadgeStyles } from "@/types/status";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";

export function ProjectRow({
  project,
  subsamples,
  expanded,
}: {
  project: Project;
  subsamples: Subsample[];
  expanded: boolean;
}) {
  const liveCount = subsamples.filter((item) => item.status === "live").length;
  const pendingCount = subsamples.filter(
    (item) => item.status === "pending",
  ).length;

  return (
    <div className="flex items-start gap-1 py-2">
      <CollapsibleTrigger asChild>
        <Button
          aria-label={`${expanded ? "Collapse" : "Expand"} ${project.name}, ${subsamples.length} subsamples`}
          className="mt-0.5 size-7 shrink-0 px-0 text-foreground"
          size="sm"
          variant="ghost"
        >
          {expanded ? (
            <ChevronDown aria-hidden="true" className="size-4" />
          ) : (
            <ChevronRight aria-hidden="true" className="size-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
          <p className="min-w-0 wrap-break-word text-lg font-normal leading-6">
            <span className="text-muted-foreground">Project: </span>
            <Link
              className="font-normal text-foreground underline-offset-4 hover:text-primary hover:underline"
              href={`/projects/${project.id}`}
            >
              {project.name}
            </Link>
          </p>
          <span className="shrink-0 whitespace-nowrap text-right text-sm text-muted-foreground">
            SID:{" "}
            <span className="font-medium text-foreground">
              {project.surveyEventId}
            </span>
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <CollapsibleTrigger asChild>
          <button type="button" aria-label={`${expanded ? "Collapse" : "Expand"} subsamples for ${project.name}`} className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-foreground hover:text-primary">
            <Folder aria-hidden="true" className="size-3.5" />
            {subsamples.length} Available Subsamples
          </button>
          </CollapsibleTrigger>
          {liveCount > 0 ? (
            <Badge variant="outline" className={statusBadgeStyles.live}>
              {liveCount} Live
            </Badge>
          ) : null}
          {pendingCount > 0 ? (
            <Badge variant="outline" className={statusBadgeStyles.pending}>
              {pendingCount} Pending
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
