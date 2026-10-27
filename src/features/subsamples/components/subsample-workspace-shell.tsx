"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { HorizontalPanels, HorizontalPanelTrigger, HorizontalPanelContent } from "@/components/ui/horizontal-panels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProjectContextPanel } from "@/features/subsamples/components/project-context-panel";
import { WorkspaceTabs } from "@/features/subsamples/components/workspace-tabs";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";

const subsampleStatusStyle: Record<Subsample["status"], string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-amber-200 bg-amber-50 text-amber-900",
  canceled: "border-rose-200 bg-rose-50 text-rose-800",
};

const subsampleStatusLabel: Record<Subsample["status"], string> = {
  live: "Live",
  pending: "Pending",
  canceled: "Canceled",
};

export function SubsampleWorkspaceShell({
  children,
  project,
  subsample,
  subsamples,
}: {
  children: ReactNode;
  project: Project;
  subsample?: Subsample;
  subsamples: Subsample[];
}) {
  return (
    <div className="space-y-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link aria-label="Projects home" href="/projects">
                <Home className="size-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projects">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{subsample?.name ?? "All Subsamples"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <HorizontalPanels side="left" label="Project" panel={<ProjectContextPanel project={project} subsample={subsample} subsamples={subsamples} />}>
        <HorizontalPanelContent>
        <section
          aria-labelledby={subsample ? "subsample-name-heading" : "all-subsamples-heading"}
          className="min-w-0 border-t pt-5 lg:border-t-0 lg:pt-0"
        >
          {subsample && <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HorizontalPanelTrigger />
              {subsample && <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Subsample Overview</p>}
            </div>
            {subsample && <Button asChild size="xs" variant="outline"><Link href={`/projects/${project.id}/subsamples`}>View All Subsamples</Link></Button>}
          </div>}
          {subsample ? <>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="mt-1 text-xl font-semibold wrap-break-word"
                id="subsample-name-heading"
              >
                {subsample.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Subsample Status:{" "}
                  <Badge
                    className={`text-sm ${subsampleStatusStyle[subsample.status]}`}
                    variant="outline"
                  >
                    {subsampleStatusLabel[subsample.status]}
                  </Badge>
                </span>
                <span className="text-muted-foreground">
                  Subsample ID:{" "}
                  <span className="font-medium text-foreground">
                    {subsample.id}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <WorkspaceTabs projectId={project.id} subsampleId={subsample.id} />
          <div className="mt-6">{children}</div>
          </> : children}
        </section>
        </HorizontalPanelContent>
      </HorizontalPanels>
    </div>
  );
}
