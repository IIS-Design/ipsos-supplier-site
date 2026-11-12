"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HorizontalPanelTrigger } from "@/components/ui/horizontal-panels";
import { Button } from "@/components/ui/button";
import { ListPagination } from "@/components/ui/list-pagination";
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
import { matchesAdvancedFilters, type RemainingFilter } from "../advanced-filters";
import { ActiveFilters, type ActiveFilter } from "@/components/ui/active-filters";
import { StatusMultiselect } from "./status-multiselect";
import { statusLabels } from "@/types/status";
import type { ProjectStatus, SubsampleStatus } from "@/types/status";
import type { Project } from "@/types/project";
import { subsampleLanguages } from "@/types/subsample";
import type { Subsample } from "@/types/subsample";
import { ProjectGroup } from "./project-group";



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
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>(["live"]);
  const [country, setCountry] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string[]>([]);
  const [fieldEndFrom, setFieldEndFrom] = useState("");
  const [fieldEndTo, setFieldEndTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubsampleStatus[]>([]);
  const [remainingFilter, setRemainingFilter] = useState<RemainingFilter>("any");
  const advancedCount = Number(statusFilter.length > 0) + Number(remainingFilter !== "any") + Number(language.length > 0) + Number(country.length > 0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(projects.filter((project) => project.status === "live").slice(0, 1).map(({ id }) => id)),
  );

  const languages = useMemo(
    () =>
      [...new Set(subsamples.filter(item => !country.length || country.includes(item.country)).flatMap(item => subsampleLanguages(item)))].sort(),
    [subsamples, country],
  );
  const countries = useMemo(() => [...new Set(subsamples.map(item => item.country))].sort(), [subsamples]);
  const changeCountries = (values: string[]) => {
    setCountry(values);
    const available = new Set(subsamples.filter(item => !values.length || values.includes(item.country)).flatMap(item => subsampleLanguages(item)));
    setLanguage(current => current.filter(value => available.has(value)));
    setPage(1);
  };
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const invalidDateRange = Boolean(
    fieldEndFrom && fieldEndTo && fieldEndFrom > fieldEndTo,
  );

  const visibleProjects = useMemo(() => {
    if (invalidDateRange) return [];

    return projects.flatMap((project) => {
      if (projectStatuses.length && !projectStatuses.includes(project.status)) return [];
      const languageAndDateMatches = subsamples.filter((subsample) => {
        if (subsample.projectId !== project.id) return false;
        if (!matchesAdvancedFilters(subsample, statusFilter, remainingFilter)) return false;
        if (country.length > 0 && !country.includes(subsample.country)) return false;
        if (language.length > 0 && !subsampleLanguages(subsample).some(value => language.includes(value))) return false;
        if (fieldEndFrom && subsample.fieldEndDate < fieldEndFrom) return false;
        if (fieldEndTo && subsample.fieldEndDate > fieldEndTo) return false;
        return true;
      });

      const projectMatchesSearch =
        !normalizedQuery ||
        contains(project.name, normalizedQuery) ||
        contains(project.surveyEventId, normalizedQuery) ||
        contains(project.id, normalizedQuery);

      const childMatchesSearch = normalizedQuery
        ? languageAndDateMatches.filter(
            (subsample) =>
              contains(subsample.name, normalizedQuery) ||
              contains(subsample.jobBookNumber ?? "", normalizedQuery) ||
              subsampleLanguages(subsample).some(value => contains(value, normalizedQuery)) ||
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
    projects,
    projectStatuses,
    country,
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
    projectStatuses.length || query || language.length > 0 || fieldEndFrom || fieldEndTo || advancedCount,
  );
  const clearFilters = () => {
    setPage(1);
    setQuery("");
    setStatusFilter([]);
    setRemainingFilter("any");
    setLanguage([]);
    setCountry([]);
    setProjectStatuses([]);
    setFieldEndFrom("");
    setFieldEndTo("");
  };

  const chips: ActiveFilter[] = [
    ...projectStatuses.map(value => ({ id: `project-${value}`, label: `Project Status: ${statusLabels[value]}`, remove: () => { setProjectStatuses(projectStatuses.filter(item => item !== value)); setPage(1); } })),
    ...statusFilter.map(value => ({ id: `status-${value}`, label: `Subsample Status: ${statusLabels[value]}`, remove: () => { setStatusFilter(statusFilter.filter(item => item !== value)); setPage(1); } })),
    ...language.map(value => ({ id: `language-${value}`, label: `Language: ${value}`, remove: () => { setLanguage(language.filter(item => item !== value)); setPage(1); } })),
    ...country.map(value => ({ id: `country-${value}`, label: `Country: ${value}`, remove: () => { changeCountries(country.filter(item => item !== value)); } })),
    ...(remainingFilter !== "any" ? [{ id: "remaining", label: `Remaining: ${remainingFilter === "zero" ? "0" : remainingFilter}`, remove: () => { setRemainingFilter("any"); setPage(1); } }] : []),
    ...(query ? [{ id: "query", label: `Search: ${query}`, remove: () => { setQuery(""); setPage(1); } }] : []),
    ...(fieldEndFrom || fieldEndTo ? [{ id: "dates", label: `Field end: ${fieldEndFrom || "Any"} – ${fieldEndTo || "Any"}`, remove: () => { setFieldEndFrom(""); setFieldEndTo(""); setPage(1); } }] : []),
  ];

  return (
    <section aria-labelledby="projects-page-heading" className="projects-explorer min-w-0 space-y-5">
      <header className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
        <h1
          className="text-2xl font-semibold tracking-tight"
          id="projects-page-heading"
        >
          Projects
        </h1>
        <div className="ml-auto flex items-center gap-1"><HorizontalPanelTrigger /></div>
      </header>

      <div className="project-filters grid min-w-0 gap-2 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="sr-only" htmlFor="project-search">Search</label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search projects and subsamples" className="pl-9" id="project-search" onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search Projects..." type="search" value={query} />
          </div>
        </div>
        <StatusMultiselect label="Project Status" values={projectStatuses} options={["live", "pending", "closed", "canceled"]} onChange={values => { setProjectStatuses(values); setPage(1); }} />
        <div className="project-date-range min-w-0 sm:col-span-2">
          <DateRangePicker
            compact
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
              <SheetDescription className="text-sm text-muted-foreground">Filter subsamples within matching projects. Changes apply immediately.</SheetDescription>
            </header>
            <div className="space-y-5">
              <div className="space-y-2">
                <StatusMultiselect showLabel label="Subsample Status" values={statusFilter} options={["live", "pending", "closed", "canceled"]} onChange={values => { setStatusFilter(values); setPage(1); }} />
              </div>
              <StatusMultiselect showLabel label="Country" values={country} options={countries} optionLabel={value => value} onChange={changeCountries} />
              <StatusMultiselect showLabel label="Languages" values={language} options={languages} optionLabel={value => value} onChange={values => { setLanguage(values); setPage(1); }} />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="subsample-remaining-filter">Remaining</label>
                <Select value={remainingFilter} onValueChange={(value) => { setRemainingFilter(value as RemainingFilter); setPage(1); }}>
                  <SelectTrigger id="subsample-remaining-filter" aria-label="Remaining" aria-describedby="remaining-filter-description"><SelectValue /></SelectTrigger>
                  <SelectContent>{[["any", "Any"], ["zero", "0"], ["1-50", "1–50"], ["51-200", "51–200"], ["200+", "200+"]].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" id="remaining-filter-description">Exclusive plus shared remaining. 200+ means more than 200.</p>
              </div>
            </div>
            <footer className="mt-auto space-y-4">
              <Separator />
              <div className="flex justify-between gap-3">
                <Button disabled={!advancedCount} onClick={() => { setStatusFilter([]); setRemainingFilter("any"); setLanguage([]); setCountry([]); setPage(1); }} type="button" variant="outline">Reset advanced filters</Button>
                <SheetClose asChild><Button type="button">Done</Button></SheetClose>
              </div>
            </footer>
          </SheetContent>
        </Sheet>
      </div>

      <ActiveFilters filters={chips} onClear={clearFilters} />

      <div className="flex min-h-6 flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {visibleProjects.length}{" "}
          {visibleProjects.length === 1 ? "project" : "projects"}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Button disabled={!visibleProjects.length || visibleProjects.every(({ project }) => expandedIds.has(project.id))} className="h-7 gap-1 px-2 text-xs [&_svg]:size-3" onClick={() => expandMatching(true)} size="sm" type="button" variant="ghost"><ChevronRight aria-hidden="true" className="size-4" />Expand All</Button>
          <Button disabled={!visibleProjects.some(({ project }) => expandedIds.has(project.id))} className="h-7 gap-1 px-2 text-xs [&_svg]:size-3" onClick={() => expandMatching(false)} size="sm" type="button" variant="ghost"><ChevronDown aria-hidden="true" className="size-4" />Collapse All</Button>
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
              : "No projects available"}
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
        <ul aria-label="Projects" className="space-y-2">
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
      <ListPagination total={visibleProjects.length} noun="projects" page={currentPage} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
    </section>
  );
}
