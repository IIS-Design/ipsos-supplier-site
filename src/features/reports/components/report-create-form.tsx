"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import { withBasePath } from "@/lib/app-path";
import { ReportScopePicker } from "./report-scope-picker";
import { ReportMultiselect } from "./report-multiselect";
import { createReportSchema, dateBounds, statusOptions, substatusOptions, zonedDayStart, zonedDayEnd, zoneLabel } from "../report-options";
import { subsampleLanguages, type Subsample } from "@/types/subsample";
import type { Project } from "@/types/project";

export function ReportCreateForm({ projects, subsamples, requestedType, timeZone, initialDates }: { projects: Project[]; subsamples: Subsample[]; requestedType?: string; timeZone: string; initialDates: { from: string; to: string } }) {
  const router = useRouter();
  const [type, setType] = useState(requestedType === "monthly_billing" ? "monthly_billing" : "respondent_info");
  const [scopeKey, setScopeKey] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [dates, setDates] = useState(initialDates);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [substatuses, setSubstatuses] = useState<string[]>([]);
  const [live, setLive] = useState(true);
  const [proofing, setProofing] = useState(true);
  const [mode, setMode] = useState("final_status");
  const [deduplicate, setDeduplicate] = useState(false);
  const [scopeError, setScopeError] = useState("");
  const scopeErrorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (scopeError) scopeErrorRef.current?.focus(); }, [scopeError]);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const [submitting, setSubmitting] = useState(false);
  const [queued, setQueued] = useState(false);
  const dirty = Boolean(scopeKey || statuses.length || substatuses.length || !live || !proofing || mode !== "final_status" || deduplicate || dates.from !== initialDates.from || dates.to !== initialDates.to || type !== (requestedType === "monthly_billing" ? "monthly_billing" : "respondent_info"));
  const release = useUnsavedChanges(!queued && dirty, "You have unsaved report options. Leave this page and discard them?");
  const choices = [
    ...projects.map(p => ({ key: `project:${p.id}`, label: p.name, description: `Project · SID ${p.surveyEventId}` })),
    ...subsamples.map(s => ({ key: `subsample:${s.id}`, label: s.name, description: `Subsample · ${s.country} · ${subsampleLanguages(s).join(", ")} · ID ${s.id} · Project: ${projects.find(p => p.id === s.projectId)?.name ?? "Unknown"}` })),
  ];
  const available = scopeKey.startsWith("project:") ? subsamples.filter(s => s.projectId === scopeKey.slice(8)) : subsamples;
  function changeScope(key: string) {
    setScopeKey(key); setError(""); setScopeError("");
    const children = key.startsWith("project:") ? subsamples.filter(s => s.projectId === key.slice(8)) : [];
    setSelected(key.startsWith("subsample:") ? [key.slice(10)] : children.length <= 10 ? children.map(s => s.id) : []);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setScopeError("");
    if (type !== "respondent_info") return;
    if (!scopeKey || !selected.length) return setScopeError(scopeKey ? "Select at least one subsample." : "Select a project or subsample.");
    if (!dates.from || !dates.to) return setError("Select both dates for the report range.");
    if (dates.from < dateBounds(timeZone).min) return setError("Start date must be within the last three months.");
    if (dates.from > dates.to) return setError("Start date must be on or before end date.");
    if (!live && !proofing) return setError("Select at least one link type.");
    const body = { type, scope: { scopeType: "subsamples", subsampleIds: selected }, dateFrom: zonedDayStart(dates.from, timeZone), dateTo: zonedDayEnd(dates.to, timeZone), timeZone, respondentStatus: statuses, respondentSubstatus: substatuses, linkType: live && proofing ? "both" : live ? "live_users" : "proofing_users", reportType: mode, deduplicateSessions: deduplicate };
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setSubmitting(true);
    try {
      const response = await fetch(withBasePath("/api/reports/"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok) { setError(result.message ?? "The report could not be queued. Please try again."); return; }
      release(); setQueued(true); router.push(`/reports?created=${encodeURIComponent(result.report.id)}`); router.refresh();
    } catch { setError("Unable to connect to the service. Please try again."); } finally { setSubmitting(false); }
  }
  const fromZone = dates.from ? zoneLabel(timeZone, dates.from) : "";
  const toZone = dates.to ? zoneLabel(timeZone, dates.to) : "";
  return <form className="mx-auto w-full max-w-3xl space-y-6" noValidate onSubmit={submit}>
    <header className="space-y-2"><Button asChild variant="ghost" className="-ml-2 px-2 text-muted-foreground"><Link href="/reports"><ArrowLeft className="size-4" />Reports</Link></Button><h1 className="text-base font-medium">{type === "monthly_billing" ? "Monthly Billing Report" : "Member Info Report"}</h1><p className="text-sm text-muted-foreground">Configure report scope and options.</p></header>
    <div className="space-y-2"><label htmlFor="report-type" className="text-sm font-medium">Report Type</label><Select value={type} onValueChange={setType}><SelectTrigger id="report-type" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="respondent_info">Member Info Report</SelectItem><SelectItem value="monthly_billing">Monthly Billing Report</SelectItem></SelectContent></Select></div>
    {type === "monthly_billing" ? <p className="text-sm text-muted-foreground">Monthly Billing Report is not available yet. Its setup and contents are pending definition.</p> : <>
    <div className="space-y-2"><label htmlFor="report-scope" className="text-sm font-medium">Project / Subsample</label><ReportScopePicker options={choices} value={scopeKey} onChange={changeScope} />{scopeError && !scopeKey && <p ref={scopeErrorRef} tabIndex={-1} role="alert" className="text-sm text-rose-800">{scopeError}</p>}</div>
    {scopeKey.startsWith("project:") && <fieldset className="space-y-2"><legend className="text-sm font-medium">Subsamples</legend><ReportMultiselect label="Subsamples" max={10} value={selected} errorId={scopeError ? "subsample-selection-error" : undefined} onChange={ids => { setSelected(ids); setScopeError(""); }} options={available.map(s => ({ id: s.id, label: s.name, description: `${s.country} · ${subsampleLanguages(s).join(", ")} · ID ${s.id}` }))} />{scopeError && <p id="subsample-selection-error" ref={scopeErrorRef} tabIndex={-1} role="alert" className="text-sm text-rose-800">{scopeError}</p>}</fieldset>}
    <fieldset className="space-y-2"><legend className="text-sm font-medium">Date Range</legend><DateRangePicker minDate={dateBounds(timeZone).min} currentDate={dateBounds(timeZone).to} initialPresetLabel="Last 2 Weeks" showPeriod periodSuffix={dates.from && dates.to ? `${fromZone}${fromZone !== toZone ? ` → ${toZone}` : ""}` : timeZone.replaceAll("_", " ")} label="Report date range" placeholder="Please select..." value={dates} onChange={setDates} /></fieldset>
    <details className="rounded-lg border"><summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">Advanced Options<ChevronDown className="size-4" /></summary><div className="space-y-5 border-t p-4">
      <fieldset className="space-y-2"><legend className="text-sm font-medium">Status</legend><ReportMultiselect label="Status" searchable={false} placeholder="All statuses" value={statuses} onChange={setStatuses} options={statusOptions.map(([id, name]) => ({ id, label: `${name.replace(/\b\w/g, letter => letter.toUpperCase())} (${id})` }))} /></fieldset>
      <fieldset className="space-y-2"><legend className="text-sm font-medium">Substatus</legend><ReportMultiselect label="Substatus" searchable={false} placeholder="All substatuses" value={substatuses} onChange={setSubstatuses} options={substatusOptions.map(([id, name]) => ({ id, label: `${name.replace(/\b\w/g, letter => letter.toUpperCase())} (${id})` }))} /></fieldset>
      <fieldset className="space-y-3"><legend className="text-sm font-medium">Link Type</legend><label className="flex items-center gap-2 text-sm"><Checkbox checked={live} onCheckedChange={v => setLive(v === true)} /><span>Live Users <span className="text-muted-foreground">(Real Respondents)</span></span></label><label className="flex items-center gap-2 text-sm"><Checkbox checked={proofing} onCheckedChange={v => setProofing(v === true)} /><span>Proofing Users <span className="text-muted-foreground">(Test Users)</span></span></label></fieldset>
      <fieldset className="space-y-3"><legend className="text-sm font-medium">Report Type</legend><RadioGroup value={mode} onValueChange={setMode} aria-label="Respondent report type">{[["final_status", "Final Status", "Respondent outcomes on the selected subsample(s), including completes, screenouts, quota fulls and abandons."], ["entered_survey", "Entered Survey", "All respondents who entered the selected subsample(s), including those reallocated to another subsample."]].map(([id, label, description]) => <label key={id} className="flex items-start gap-3 rounded-md border p-3"><RadioGroupItem value={id} className="mt-0.5" /><span className="text-sm"><span className="block font-medium">{label}</span><span className="text-muted-foreground">{description}</span></span></label>)}</RadioGroup></fieldset>
      <div><label className="flex items-center gap-2 text-sm"><Checkbox checked={deduplicate} onCheckedChange={v => setDeduplicate(v === true)} />One row per respondent</label><p className="mt-2 text-xs text-muted-foreground">Combine multiple sessions from the same respondent into one row. Leave unchecked to retain all sessions for troubleshooting.</p></div>
    </div></details></>}
    {error && <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
    <div className="flex gap-3 border-t pt-5"><Button type="submit" disabled={submitting || type === "monthly_billing" || !subsamples.length}>{submitting ? "Queuing…" : "Run Report"}</Button><Button asChild variant="outline"><Link href="/reports">Cancel</Link></Button></div>
  </form>;
}
