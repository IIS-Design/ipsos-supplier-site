"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { matchesAdvancedFilters, type StatusFilter, type RemainingFilter } from "../advanced-filters";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";
import { ProjectGroup } from "./project-group";

type ProjectView = "live" | "pending";

type ProjectsExplorerProps = {
  projects: Project[];
  subsamples: Subsample[];
};

function contains(value: string, query: string): boolean {
  return value.toLocaleLowerCase().includes(query);
}

export function ProjectsExplorer({
  projects,
  subsamples,
}: ProjectsExplorerProps) {
  const [view, setView] = useState<ProjectView>("live");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [fieldEndFrom, setFieldEndFrom] = useState("");
  const [fieldEndTo, setFieldEndTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("any");
  const [remainingFilter, setRemainingFilter] = useState<RemainingFilter>("any");
  const advancedCount = Number(statusFilter !== "any") + Number(remainingFilter !== "any");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(projects.filter((project) => project.status === "live").slice(0, 1).map(({ id }) => id)),
  );

  const languages = useMemo(
    () =>
      [...new Set(subsamples.map((subsample) => subsample.language))].sort(),
    [subsamples],
  );
  const liveProjects = projects.filter((project) => project.status === "live");
  const pendingProjects = projects.filter(
    (project) => project.status === "pending",
  );
  const projectsInView = view === "live" ? liveProjects : pendingProjects;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const invalidDateRange = Boolean(
    fieldEndFrom && fieldEndTo && fieldEndFrom > fieldEndTo,
  );

  const visibleProjects = useMemo(() => {
    if (invalidDateRange) return [];

    return projectsInView.flatMap((project) => {
      const languageAndDateMatches = subsamples.filter((subsample) => {
        if (subsample.projectId !== project.id) return false;
        if (!matchesAdvancedFilters(subsample, statusFilter, remainingFilter)) return false;
        if (language !== "all" && subsample.language !== language) return false;
        if (fieldEndFrom && subsample.fieldEndDate < fieldEndFrom) return false;
        if (fieldEndTo && subsample.fieldEndDate > fieldEndTo) return false;
        return true;
      });

      const projectMatchesSearch =
        !normalizedQuery ||
        contains(project.name, normalizedQuery) ||
        contains(project.surveyEventId, normalizedQuery) ||
        contains(project.jobBookNumber, normalizedQuery) ||
        contains(project.id, normalizedQuery);

      const childMatchesSearch = normalizedQuery
        ? languageAndDateMatches.filter(
            (subsample) =>
              contains(subsample.name, normalizedQuery) ||
              contains(subsample.language, normalizedQuery) ||
              contains(subsample.country, normalizedQuery) ||
              contains(subsample.id, normalizedQuery),
          )
        : languageAndDateMatches;

      const matchingSubsamples = projectMatchesSearch
        ? languageAndDateMatches
        : childMatchesSearch;

      if (matchingSubsamples.length === 0) return [];
      return [{ project, subsamples: matchingSubsamples }];
    });
  }, [
    fieldEndFrom,
    fieldEndTo,
    statusFilter,
    remainingFilter,
    invalidDateRange,
    language,
    normalizedQuery,
    projectsInView,
    subsamples,
  ]);

  const pageCount = Math.max(1, Math.ceil(visibleProjects.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageProjects = visibleProjects.slice(pageStart, pageStart + pageSize);
  const setExpanded = (id: string, open: boolean) => setExpandedIds((current) => {
    const next = new Set(current);
    if (open) next.add(id);
    else next.delete(id);
    return next;
  });
  const expandMatching = (open: boolean) => setExpandedIds((current) => {
    const next = new Set(current);
    for (const { project } of visibleProjects) {
      if (open) next.add(project.id);
      else next.delete(project.id);
    }
    return next;
  });

  const hasActiveFilters = Boolean(
    query || language !== "all" || fieldEndFrom || fieldEndTo || advancedCount,
  );
  const clearFilters = () => {
    setPage(1);
    setQuery("");
    setStatusFilter("any");
    setRemainingFilter("any");
    setLanguage("all");
    setFieldEndFrom("");
    setFieldEndTo("");
  };

  return (
    <section aria-labelledby="projects-page-heading" className="projects-explorer min-w-0 space-y-5">
      <header className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
        <h1
          className="text-2xl font-semibold tracking-tight"
          id="projects-page-heading"
        >
          Projects
        </h1>
        <div
          aria-label="Project status view"
          className="inline-flex items-center gap-1 rounded-lg border bg-muted p-1"
          role="group"
        >
          <Button
            aria-pressed={view === "live"}
            className={`gap-2 rounded-md border px-3 ${view === "live" ? "border-border bg-white font-semibold text-foreground hover:bg-white" : "border-transparent text-muted-foreground"}`}
            onClick={() => { setView("live"); setPage(1); }}
            size="sm"
            variant="ghost"
          >
            Live Projects
            <Badge
              className="border-transparent bg-emerald-700 text-white"
              variant="outline"
            >
              {liveProjects.length}
            </Badge>
          </Button>
          <Button
            aria-pressed={view === "pending"}
            className={`gap-2 rounded-md border px-3 ${view === "pending" ? "border-border bg-white font-semibold text-foreground hover:bg-white" : "border-transparent text-muted-foreground"}`}
            onClick={() => { setView("pending"); setPage(1); }}
            size="sm"
            variant="ghost"
          >
            Pending Projects
            <Badge
              className="border-transparent bg-slate-200 text-slate-800"
              variant="outline"
            >
              {pendingProjects.length}
            </Badge>
          </Button>
        </div>
      </header>

      <div className="project-filters grid min-w-0 gap-2 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="sr-only" htmlFor="project-search">Search</label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search projects and subsamples" className="pl-9" id="project-search" onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search Projects..." type="search" value={query} />
          </div>
        </div>
        <div className="min-w-0">
          <label className="sr-only" htmlFor="language-filter">Language</label>
          <Select onValueChange={(value) => { setLanguage(value); setPage(1); }} value={language}>
            <SelectTrigger aria-label="Filter by language" className="h-10 w-full" id="language-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {languages.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="project-date-range min-w-0 sm:col-span-2">
          <DateRangePicker
            label="Field end date range"
            value={{ from: fieldEndFrom, to: fieldEndTo }}
            onChange={(range) => { setFieldEndFrom(range.from); setFieldEndTo(range.to); setPage(1); }}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild><Button className="h-10 gap-2 shadow-none" type="button" variant="outline"><SlidersHorizontal aria-hidden="true" className="size-4" />Filters{advancedCount ? <Badge variant="secondary">{advancedCount}<span className="sr-only"> active advanced filters</span></Badge> : null}</Button></SheetTrigger>
          <SheetContent>
            <header className="space-y-2 pr-8">
              <SheetTitle className="text-lg font-semibold">Advanced Filters</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">Filter Subsamples within the current Project view. Changes apply immediately.</SheetDescription>
            </header>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="subsample-status-filter">Subsample Status</label>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as StatusFilter); setPage(1); }}>
                  <SelectTrigger id="subsample-status-filter"><SelectValue /></SelectTrigger>
                  <SelectContent>{[["any", "Any"], ["live", "Live"], ["pending", "Pending"], ["canceled", "Canceled"]].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="subsample-remaining-filter">Remaining</label>
                <Select value={remainingFilter} onValueChange={(value) => { setRemainingFilter(value as RemainingFilter); setPage(1); }}>
                  <SelectTrigger id="subsample-remaining-filter" aria-describedby="remaining-filter-description"><SelectValue /></SelectTrigger>
                  <SelectContent>{[["any", "Any"], ["zero", "0"], ["1-50", "1–50"], ["51-200", "51–200"], ["200+", "200+"]].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" id="remaining-filter-description">Exclusive plus shared remaining. 200+ means more than 200.</p>
              </div>
            </div>
            <footer className="mt-auto space-y-4">
              <Separator />
              <div className="flex justify-between gap-3">
                <Button disabled={!advancedCount} onClick={() => { setStatusFilter("any"); setRemainingFilter("any"); setPage(1); }} type="button" variant="outline">Reset advanced filters</Button>
                <SheetClose asChild><Button type="button">Done</Button></SheetClose>
              </div>
            </footer>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex min-h-6 flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {visibleProjects.length} {view}{" "}
          {visibleProjects.length === 1 ? "project" : "projects"}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Button disabled={!visibleProjects.length || visibleProjects.every(({ project }) => expandedIds.has(project.id))} onClick={() => expandMatching(true)} size="sm" type="button" variant="ghost"><ChevronRight aria-hidden="true" className="size-4" />Expand All</Button>
          <Button disabled={!visibleProjects.some(({ project }) => expandedIds.has(project.id))} onClick={() => expandMatching(false)} size="sm" type="button" variant="ghost"><ChevronDown aria-hidden="true" className="size-4" />Collapse All</Button>
        {hasActiveFilters ? (
          <Button
            className="h-8 gap-1.5 px-2 text-muted-foreground"
            onClick={clearFilters}
            size="sm"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-3.5" />
            Clear Filters
          </Button>
        ) : null}
        </div>
      </div>

      {invalidDateRange ? (
        <p className="text-sm text-destructive" role="alert">
          The start date must be on or before the end date.
        </p>
      ) : null}

      {projects.length === 0 ? (
        <div className="rounded-md border bg-white px-5 py-10 text-center">
          <p className="font-medium">No projects available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Projects you participate in will appear here.
          </p>
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="rounded-md border bg-white px-5 py-10 text-center">
          <p className="font-medium">
            {hasActiveFilters
              ? "No projects match these filters"
              : `No ${view} projects available`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try changing your search or filter selections."
              : "Projects in this view will appear here when available."}
          </p>
          {hasActiveFilters ? (
            <Button
              className="mt-4"
              onClick={clearFilters}
              size="sm"
              variant="outline"
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <ul aria-label={`${view} projects`} className="space-y-2">
          {pageProjects.map(({ project, subsamples }) => (
            <ProjectGroup
              open={expandedIds.has(project.id)}
              onOpenChange={(open) => setExpanded(project.id, open)}
              key={project.id}
              project={project}
              subsamples={subsamples}
            />
          ))}
        </ul>
      )}
      {visibleProjects.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {pageStart + 1}–{Math.min(pageStart + pageSize, visibleProjects.length)} of {visibleProjects.length} projects
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground" htmlFor="project-page-size">Items per page</label>
            <Select onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }} value={String(pageSize)}>
              <SelectTrigger className="w-20" id="project-page-size" aria-label="Items per page"><SelectValue /></SelectTrigger>
              <SelectContent>{[10, 20, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
            </Select>
            <nav aria-label="Projects pagination" className="flex items-center gap-2">
              <Button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} size="sm" type="button" variant="outline">Previous</Button>
              <span className="text-sm tabular-nums" aria-live="polite">Page {currentPage} of {pageCount}</span>
              <Button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} size="sm" type="button" variant="outline">Next</Button>
            </nav>
          </div>
        </div>
      ) : null}
    </section>
  );
}
