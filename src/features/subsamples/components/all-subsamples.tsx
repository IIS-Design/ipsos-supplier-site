"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { filterSubsamples } from "@/features/subsamples/subsample-list-filters";
import type { Subsample } from "@/types/subsample";

const statuses = { live: { label: "Live", style: "border-emerald-200 bg-emerald-50 text-emerald-800" }, pending: { label: "Pending", style: "border-amber-200 bg-amber-50 text-amber-900" }, canceled: { label: "Canceled", style: "border-rose-200 bg-rose-50 text-rose-800" } };
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }

export function AllSubsamples({ projectName, subsamples }: { projectName: string; subsamples: Subsample[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [language, setLanguage] = useState("all");
  const [router, setRouter] = useState("all");
  const [dates, setDates] = useState({ from: "", to: "" });
  const active = Boolean(query || status !== "all" || language !== "all" || router !== "all" || dates.from || dates.to);
  const results = filterSubsamples(subsamples, { query, status, language, router, ...dates });
  const languages = [...new Set(subsamples.map(item => item.language))].sort();
  const routers = [...new Set(subsamples.map(item => item.router).filter((value): value is string => !!value))].sort();
  function clear() { setQuery(""); setStatus("all"); setLanguage("all"); setRouter("all"); setDates({ from: "", to: "" }); }
  return <section className="@container min-w-0 space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 id="all-subsamples-heading" className="min-w-0 text-2xl font-semibold tracking-tight wrap-break-word">Subsamples for {projectName}</h1><p className="flex shrink-0 items-center gap-2 text-sm" role="status" aria-live="polite" aria-atomic="true"><Badge>{results.length}</Badge>Available Subsample(s)</p></header>
    <div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search subsamples by name or ID" placeholder="Search by name or ID..." value={query} onChange={event => setQuery(event.target.value)} className="pl-9 pr-11" />{query && <Button aria-label="Clear subsample search" type="button" variant="ghost" className="absolute right-0 top-0 size-10 px-0" onClick={() => setQuery("")}><X aria-hidden="true" className="size-4" /></Button>}</div>
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(200px,1.5fr)]">
      <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Filter subsamples by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Status: All</SelectItem>{Object.entries(statuses).map(([value, option]) => <SelectItem key={value} value={value}>{option.label}</SelectItem>)}</SelectContent></Select>
      <Select value={language} onValueChange={setLanguage}><SelectTrigger aria-label="Filter subsamples by language"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Language: All</SelectItem>{languages.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
      <Select value={router} onValueChange={setRouter}><SelectTrigger aria-label="Filter subsamples by router"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Router: All</SelectItem>{routers.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}{subsamples.some(item => !item.router) && <SelectItem value="unassigned">Not assigned</SelectItem>}</SelectContent></Select>
      <DateRangePicker label="Field end date range" value={dates} onChange={setDates} />
    </div>
    {active && <div className="flex justify-end"><Button onClick={clear} type="button" size="sm" variant="ghost" className="h-8 gap-1.5 px-2 text-muted-foreground"><X aria-hidden="true" className="size-3.5" />Clear all filters</Button></div>}
    {!results.length ? <div className="rounded-md border p-8 text-center"><h2 className="font-medium">No subsamples found</h2><p className="mt-2 text-muted-foreground">Try changing or clearing your search and filters.</p><Button onClick={clear} type="button" variant="outline" className="mt-4">Clear all filters</Button></div> : <ul aria-label="Available subsamples" className="space-y-3">{results.map(item => <li key={item.id}><SubsampleCard subsample={item} /></li>)}</ul>}
  </section>;
}
function SubsampleCard({ subsample: item }: { subsample: Subsample }) {
  const status = statuses[item.status];
  const fields = [ ["ID", item.id], ["Status", <Badge key="status" variant="outline" className={status.style}>{status.label}</Badge>], ["Language", item.language], ["Visitors", item.visitors], ["Completes", item.achievedCompletes], ["Incidence", `${item.incidence}%`], ["LOI", `${item.loi} min`], ["Field Start Date", formatDate(item.fieldStartDate)], ["Field End Date", formatDate(item.fieldEndDate)] ] as const;
  return <article className="@container relative min-w-0 rounded-md border bg-white p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 focus-within:ring-2 focus-within:ring-ring">
    <h2 className="text-base font-medium leading-5 wrap-break-word"><Link className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none" href={`/projects/${item.projectId}/subsamples/${item.id}/details`}>{item.name}</Link></h2>
    <p className="mt-1 text-sm text-muted-foreground wrap-break-word">Router: {item.router || "Not assigned"}</p>
    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 @sm:grid-cols-3 @xl:grid-cols-5 @2xl:grid-cols-[minmax(100px,1.4fr)_minmax(80px,1fr)_repeat(5,minmax(0,1fr))_repeat(2,minmax(85px,1.1fr))]">{fields.map(([label, value]) => <div className="min-w-0" key={label}><dt className="text-xs font-medium">{label}</dt><dd className="mt-1 text-sm font-normal text-muted-foreground wrap-break-word">{value}</dd></div>)}</dl>
  </article>;
}
