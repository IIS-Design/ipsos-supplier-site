"use client";


import { HorizontalPanelTrigger } from "@/components/ui/horizontal-panels";

import Link from "next/link";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { StatusMultiselect } from "@/features/projects/components/status-multiselect";
import { ActiveFilters, type ActiveFilter } from "@/components/ui/active-filters";
import { filterSubsamples } from "@/features/subsamples/subsample-list-filters";
import { statusLabels, statusBadgeStyles, isProjectStatus } from "@/types/status";
import { subsampleLanguages } from "@/types/subsample";
import type { Subsample } from "@/types/subsample";

const statuses = Object.fromEntries(Object.entries(statusLabels).map(([value, label]) => [value, { label, style: statusBadgeStyles[value as keyof typeof statusLabels] }]));
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }

export function AllSubsamples({ projectName, subsamples }: { projectName: string; subsamples: Subsample[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [language, setLanguage] = useState<string[]>([]);
  const [dates, setDates] = useState({ from: "", to: "" });
  const results = filterSubsamples(subsamples, { query, status, language, router: [], ...dates });
  const languages = [...new Set(subsamples.flatMap(item => subsampleLanguages(item)))].sort();
  function clear() { setQuery(""); setStatus([]); setLanguage([]); setDates({ from: "", to: "" }); }
  const chips: ActiveFilter[] = [
    ...status.map(value => ({ id: `status-${value}`, label: `Status: ${isProjectStatus(value) ? statusLabels[value] : value}`, remove: () => setStatus(status.filter(item => item !== value)) })),
    ...language.map(value => ({ id: `language-${value}`, label: `Language: ${value}`, remove: () => setLanguage(language.filter(item => item !== value)) })),
    ...(query ? [{ id: "query", label: `Search: ${query}`, remove: () => setQuery("") }] : []),
    ...(dates.from || dates.to ? [{ id: "dates", label: `Field end: ${dates.from || "Any"} – ${dates.to || "Any"}`, remove: () => setDates({ from: "", to: "" }) }] : []),
  ];
  return <section className="@container min-w-0 space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><HorizontalPanelTrigger /><h1 id="all-subsamples-heading" className="min-w-0 text-2xl font-semibold tracking-tight wrap-break-word">Subsamples for {projectName}</h1></div><div className="ml-auto flex items-center gap-3"><p className="flex shrink-0 items-center gap-2 text-sm" role="status" aria-live="polite" aria-atomic="true"><Badge>{results.length}</Badge>Available Subsample(s)</p></div></header>
    <div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search subsamples by name or ID" placeholder="Search by name or ID..." value={query} onChange={event => setQuery(event.target.value)} className="pl-9 pr-11" />{query && <Button aria-label="Clear subsample search" type="button" variant="ghost" className="absolute right-0 top-0 size-10 px-0" onClick={() => setQuery("")}><X aria-hidden="true" className="size-4" /></Button>}</div>
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(200px,1.5fr)]">
      <StatusMultiselect label="Status" values={status} options={Object.keys(statuses)} onChange={setStatus} />
      <StatusMultiselect label="Language" values={language} options={languages} optionLabel={value => value} onChange={setLanguage} />
      <DateRangePicker label="Field end date range" value={dates} onChange={setDates} />
    </div>
    <ActiveFilters filters={chips} onClear={clear} />
    {!results.length ? <div className="rounded-md border p-8 text-center"><h2 className="font-medium">No subsamples found</h2><p className="mt-2 text-muted-foreground">Try changing or clearing your search and filters.</p><Button onClick={clear} type="button" variant="outline" className="mt-4">Clear all filters</Button></div> : <ul aria-label="Available subsamples" className="space-y-3">{results.map(item => <li key={item.id}><SubsampleCard subsample={item} /></li>)}</ul>}
  </section>;
}
function SubsampleCard({ subsample: item }: { subsample: Subsample }) {
  const status = statuses[item.status];
  const fields = [ ["ID", item.id], ["Status", <Badge key="status" variant="outline" className={status.style}>{status.label}</Badge>], ["Country", item.country], ["Languages", subsampleLanguages(item).join(", ")], ["Visitors", item.visitors], ["Completes", item.achievedCompletes], ["Incidence", `${item.incidence}%`], ["LOI", `${item.loi} min`], ["Field Start Date", formatDate(item.fieldStartDate)], ["Field End Date", formatDate(item.fieldEndDate)] ] as const;
  return <article className="@container relative min-w-0 rounded-md border bg-white p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 focus-within:ring-2 focus-within:ring-ring">
    <h2 className="text-base font-medium leading-5 wrap-break-word"><Link className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none" href={`/projects/${item.projectId}/subsamples/${item.id}/details`}>{item.name}</Link></h2>
    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 @sm:grid-cols-3 @xl:grid-cols-5 @2xl:grid-cols-[minmax(100px,1.4fr)_minmax(80px,1fr)_repeat(5,minmax(0,1fr))_repeat(2,minmax(85px,1.1fr))]">{fields.map(([label, value]) => <div className="min-w-0" key={label}><dt className="text-xs font-medium">{label}</dt><dd className="mt-1 text-sm font-normal text-muted-foreground wrap-break-word">{value}</dd></div>)}</dl>
  </article>;
}
