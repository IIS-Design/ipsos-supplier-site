import Link from "next/link";
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
    <div className="flex items-start gap-1 py-2.5">
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
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="min-w-0 text-lg font-normal leading-6">
            <span className="text-muted-foreground">Project: </span>
            <Link
              className="font-normal text-foreground underline-offset-4 hover:text-primary hover:underline"
              href={`/projects/${project.id}`}
            >
              {project.name}
            </Link>
          </p>
          <span className="shrink-0 text-sm text-muted-foreground">
            ID:{" "}
            <span className="font-medium text-foreground">
              {project.surveyEventId}
            </span>
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <Folder aria-hidden="true" className="size-3.5" />
            {subsamples.length} Available Subsamples
          </span>
          {liveCount > 0 ? (
            <span className="font-medium text-emerald-800">
              {liveCount} Live
            </span>
          ) : null}
          {pendingCount > 0 ? (
            <span className="text-muted-foreground">
              {pendingCount} Pending
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
