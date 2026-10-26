"use client";

import { Check, X, Minus, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { confirmContactNavigation } from "@/features/contacts/use-unsaved-changes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";

const projectStatusLabel: Record<Project["status"], string> = {
  live: "Live",
  pending: "Pending",
  closed: "Closed",
  canceled: "Canceled",
};

const projectStatusStyle: Record<Project["status"], string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pending: "border-amber-200 bg-amber-50 text-amber-900",
  closed: "border-slate-200 bg-slate-100 text-slate-700",
  canceled: "border-rose-200 bg-rose-50 text-rose-800",
};

export function ProjectContextPanel({
  project,
  subsample,
  subsamples,
}: {
  project: Project;
  subsample?: Subsample;
  subsamples: Subsample[];
}) {
  const router = useRouter();

  return (
    <aside
      aria-labelledby="project-context-heading"
      className="space-y-5 lg:pr-6"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Project
        </p>
        <h2 className="mt-1 text-xl font-semibold" id="project-context-heading">
          {project.name}
        </h2>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Badge className="rounded-full px-2" variant="secondary">
            {subsamples.length}
          </Badge>
          <span>Subsample(s)</span>
        </div>
        <label className="sr-only" htmlFor="subsample-selector">
          Select a subsample in {project.name}
        </label>
        <Select
          onValueChange={(nextSubsampleId) => {
            if (!confirmContactNavigation()) return;
            router.push(nextSubsampleId === "all" ? `/projects/${project.id}/subsamples` : `/projects/${project.id}/subsamples/${nextSubsampleId}/details`);
          }}
          value={subsample?.id ?? "all"}
        >
          <SelectTrigger
            aria-label="Select subsample"
            className="w-full text-base font-medium"
            id="subsample-selector"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">View All Subsamples</SelectItem>
            {subsamples.map((item) => (
              <SelectItem className="text-base font-medium" key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4 text-sm">
        <div className="col-span-2 flex items-center justify-between gap-2">
          <dt className="font-medium">Project Status</dt>
          <dd>
            <Badge
              className={projectStatusStyle[project.status]}
              variant="outline"
            >
              {projectStatusLabel[project.status]}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="font-medium">Project ID</dt>
          <dd className="mt-1 text-muted-foreground">
            {project.surveyEventId}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Job Book No°</dt>
          <dd className="mt-1 text-muted-foreground">
            {project.jobBookNumber}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="font-medium">Device Compatibility</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {([ ["mobile", "Mobile"], ["tablet", "Tablet"], ["desktop", "Desktop"] ] as const).map(([key, label]) => {
              const supported = project.deviceCompatibility?.[key];
              const Icon = supported === undefined ? Minus : supported ? Check : X;
              return <Badge key={key} variant={supported ? "outline" : "secondary"} aria-label={`${label}: ${supported === undefined ? "Not defined" : supported ? "Supported" : "Not supported"}`} className="gap-1"><Icon aria-hidden="true" className="size-3" />{label}<span className="sr-only">{supported === undefined ? " — Not defined" : supported ? " — Supported" : " — Not supported"}</span></Badge>;
            })}
          </dd>
        </div>
        <div className="col-span-2"><dt className="font-medium">Product Type</dt><dd className="mt-1 wrap-break-word text-muted-foreground">{project.productType || "Not Defined"}</dd></div>
        <div className="col-span-2"><dt className="font-medium">Research Type</dt><dd className="mt-1 wrap-break-word text-muted-foreground">{project.researchType || "Not Defined"}</dd></div>
        <div className="col-span-2 min-w-0">
          <dt className="font-medium">Categories</dt>
          <dd className="mt-2 space-y-3">
            {project.categoryPaths?.length ? project.categoryPaths.map((path, pathIndex) => <ol key={pathIndex} aria-label={`Category path ${pathIndex + 1}`} className="flex flex-wrap items-center gap-x-1 gap-y-1">{path.map((level, index) => <Fragment key={index}><li className={`min-w-0 max-w-full wrap-break-word ${index === path.length - 1 ? "text-foreground" : "text-muted-foreground"}`}>{level}</li>{index < path.length - 1 && <li aria-hidden="true"><ChevronRight className="size-3.5 text-muted-foreground" /></li>}</Fragment>)}</ol>) : <p className="text-muted-foreground">Not Defined</p>}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
