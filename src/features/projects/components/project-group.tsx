"use client";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";
import { ProjectExpansion } from "./project-expansion";
import { ProjectRow } from "./project-row";

export function ProjectGroup({
  project,
  subsamples,
  open,
  onOpenChange,
}: {
  project: Project;
  subsamples: Subsample[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <li className="rounded-md border border-border bg-white px-3 py-1">
      <Collapsible onOpenChange={onOpenChange} open={open}>
        <ProjectRow expanded={open} project={project} subsamples={subsamples} />
        <CollapsibleContent>
          <div className="pb-1 pl-8 pr-1">
            <ProjectExpansion subsamples={subsamples} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
