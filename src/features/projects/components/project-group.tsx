"use client";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";
import { ProjectExpansion } from "./project-expansion";
import { ProjectRow } from "./project-row";
import styles from "@/components/ui/surface-gradient.module.css";

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
    <li className={`${styles.card} rounded-md border border-border px-2 py-1`}>
      <Collapsible onOpenChange={onOpenChange} open={open}>
        <ProjectRow expanded={open} project={project} subsamples={subsamples} />
        <CollapsibleContent>
          <div className="pb-2 pl-8 pr-1">
            <ProjectExpansion subsamples={subsamples} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
