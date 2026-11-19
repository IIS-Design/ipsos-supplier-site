"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { usePrototypeState } from "@/components/prototype-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ViewCountBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withBasePath } from "@/lib/app-path";
import { costsForView, filterCostGroups, getCostTotals, groupCosts } from "@/features/costs/cost-groups";
import type { CostGroup } from "@/features/costs/cost-groups";
import { previewCostAdjustments } from "@/features/costs/cost-scenarios";
import { CostEventCard, money } from "./cost-event-card";
import type { Cost } from "@/types/cost";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";
import { CountryFlag } from "@/components/ui/country-flag";
import type { User, UserRole } from "@/types/user";

type View = "pending" | "history";
type Decision = "approved" | "rejected";
const childIds = (group: CostGroup) => group.subsamples.map(item => `${group.id}/subsample/${item.id}`);

export function CostsWorkspace({ costs: sourceCosts, projects, subsamples, supplierName, users, userRole }: {
  costs: Cost[]; projects: Project[]; subsamples: Subsample[]; supplierName: string; users: User[]; userRole: UserRole;
}) {
  const { empty, scenario, setScenario } = usePrototypeState();
  const router = useRouter();
  const costs = useMemo(() => empty ? [] : previewCostAdjustments(sourceCosts, scenario), [empty, sourceCosts, scenario]);
  const canDecide = userRole === "admin";
  const previewing = scenario === "costs-with-adjustments" || scenario === "costs-without-adjustments";
  const [view, setView] = useState<View>("pending");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [decision, setDecision] = useState<Decision | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pendingGroups = useMemo(() => groupCosts(costsForView(costs, "pending"), projects, subsamples), [costs, projects, subsamples]);
  const historyGroups = useMemo(() => groupCosts(costsForView(costs, "history"), projects, subsamples).sort((a, b) => {
    const latest = (group: CostGroup) => group.records.reduce((date, cost) => {
      const next = cost.approval?.decidedAt ?? cost.publishedAt ?? "";
      return next > date ? next : date;
    }, "");
    return latest(b).localeCompare(latest(a));
  }), [costs, projects, subsamples]);
  const countries = [...new Set([...costs.map(cost => cost.country), ...subsamples.map(item => item.country)])].filter(Boolean).sort();
  const invalidDates = view === "history" && Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const rows = filterCostGroups(view === "pending" ? pendingGroups : historyGroups, {
    search, country, dateFrom: view === "history" ? dateFrom : undefined, dateTo: view === "history" ? dateTo : undefined,
  });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const pageRows = view === "history" ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize) : rows;
  const selectedGroups = rows.filter(group => selectedIds.has(group.id));
  // Send all pending entries of selected events, even if only one child matched a filter.
  const selectedCostIds = selectedGroups.flatMap(group => group.records.map(cost => cost.id));
  const selectedTotals = getCostTotals(selectedGroups.flatMap(group => group.records));
  const allSelected = rows.length > 0 && selectedGroups.length === rows.length;
  const clearSelection = () => { setSelectedIds(new Set()); setPage(1); };
  function toggleExpanded(id: string) {
    setExpandedIds(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function expandMatching(open: boolean) {
    setExpandedIds(current => {
      const next = new Set(current);
      pageRows.forEach(group => [group.id, ...childIds(group)].forEach(id => { if (open) next.add(id); else next.delete(id); }));
      return next;
    });
  }
  function selectGroup(id: string, checked: boolean) {
    setSelectedIds(current => { const next = new Set(current); if (checked) next.add(id); else next.delete(id); return next; });
  }
  function changeView(next: string) {
    setView(next as View); setCountry("all"); setDateFrom(""); setDateTo(""); clearSelection();
  }
  async function submitDecision() {
    if (!decision || !selectedCostIds.length) return;
    setProcessing(true); setError(null); setSuccess(null);
    try {
      const response = await fetch(withBasePath("/api/costs/decisions/"), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, costIds: selectedCostIds }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) { setError(payload.message ?? "Unable to update selected costs."); return; }
      setSuccess(`${selectedGroups.length} survey event(s) ${decision} successfully. The decision is recorded in History.`);
      setDecision(null); clearSelection(); router.refresh();
    } catch { setError("Unable to connect to the service. Please try again."); }
    finally { setProcessing(false); }
  }
  const hasFilters = Boolean(search.trim() || country !== "all" || dateFrom || dateTo);
  return <div className="space-y-5">
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2"><h1 className="text-2xl font-semibold tracking-tight">Costs</h1><Tabs value={view} onValueChange={changeView}><TabsList aria-label="Cost views"><TabsTrigger value="pending">Pending Approval <ViewCountBadge active={view === "pending"} className="ml-2">{pendingGroups.length}</ViewCountBadge></TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList></Tabs></header>
    {previewing && <p className="text-sm text-muted-foreground">Previewing example adjustments. <button type="button" className="text-primary underline underline-offset-4" onClick={() => setScenario("")}>Return to current data to approve costs</button>.</p>}
    {success && <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">{success}</p>}
    <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_240px]">
      <div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search costs by project, SID, subsample, or job book" placeholder="Search by Project, SID, Subsample or Job Book..." className="pl-9" value={search} onChange={event => { setSearch(event.target.value); clearSelection(); }} /></div>
      {view === "pending" ? <Select value={country} onValueChange={value => { setCountry(value); clearSelection(); }}><SelectTrigger aria-label="Filter costs by country"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Country: All</SelectItem>{countries.map(item => <SelectItem key={item} value={item}><span className="inline-flex items-center gap-1.5"><CountryFlag country={item} /><span>{item}</span></span></SelectItem>)}</SelectContent></Select> : <DateRangePicker label="Approval date range" value={{ from: dateFrom, to: dateTo }} onChange={range => { setDateFrom(range.from); setDateTo(range.to); clearSelection(); }} />}

    </div>
    {invalidDates && <p className="text-sm text-destructive" role="alert">Start date must be on or before end date.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      {canDecide && view === "pending" && <div className="flex flex-wrap items-center gap-3"><label className="flex min-h-9 items-center gap-2 text-sm"><Checkbox aria-label="Select all visible pending survey events" checked={allSelected ? true : selectedGroups.length > 0 ? "indeterminate" : false} onCheckedChange={checked => setSelectedIds(checked === true ? new Set(rows.map(group => group.id)) : new Set())} />Select all</label><span className="text-sm text-muted-foreground" aria-live="polite">{selectedGroups.length} Selected</span>{selectedTotals.length > 0 && <span className="text-sm font-medium tabular-nums" aria-live="polite">Total Cost: {selectedTotals.map(total => money(total.amount, total.currency)).join(" + ")}</span>}<Button variant="success" disabled={!selectedGroups.length || processing || previewing} onClick={() => { setError(null); setDecision("approved"); }}>Approve Selected</Button><Button disabled={!selectedGroups.length || processing || previewing} variant="outline" onClick={() => { setError(null); setDecision("rejected"); }}>Reject Selected</Button></div>}
      <div className="ml-auto flex flex-wrap items-center gap-1"><Button size="sm" variant="ghost" disabled={!pageRows.length || pageRows.every(group => [group.id, ...childIds(group)].every(id => expandedIds.has(id)))} onClick={() => expandMatching(true)}><ChevronRight className="size-4" aria-hidden="true" />Expand All</Button><Button size="sm" variant="ghost" disabled={!pageRows.some(group => expandedIds.has(group.id))} onClick={() => expandMatching(false)}><ChevronDown className="size-4" aria-hidden="true" />Collapse All</Button>{hasFilters && <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { setSearch(""); setCountry("all"); setDateFrom(""); setDateTo(""); clearSelection(); }}><X className="size-3.5" aria-hidden="true" />Clear Filters</Button>}</div>
    </div>
    {hasFilters && rows.length > 0 && <p className="text-xs text-muted-foreground">Matching survey events include all their {view === "pending" ? "pending" : "processed"} cost entries.</p>}
    {rows.length ? <ul className="space-y-3" aria-label={view === "pending" ? "Survey events pending cost approval" : "Survey event cost history"}>{pageRows.map(group => <CostEventCard key={group.id} group={group} open={expandedIds.has(group.id)} onOpenChange={() => toggleExpanded(group.id)} expandedIds={expandedIds} onToggleSubsample={toggleExpanded} selected={selectedIds.has(group.id)} onSelect={checked => selectGroup(group.id, checked)} canSelect={canDecide && view === "pending"} history={view === "history"} users={users} supplierName={supplierName} />)}</ul> : <div className="rounded-md border bg-card px-5 py-10 text-center"><p className="font-medium">{!costs.length ? "No costs available" : hasFilters ? "No costs match these filters" : view === "pending" ? "No costs are pending approval" : "No cost history available"}</p><p className="mt-1 text-sm text-muted-foreground">{view === "pending" ? "New pending cost records will appear here." : "Processed cost records will appear here."}</p></div>}
    {view === "history" && <ListPagination total={rows.length} noun="survey events" page={currentPage} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} />}
    <AlertDialog open={decision !== null} onOpenChange={open => { if (!open && !processing) setDecision(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{decision === "approved" ? "Approve selected costs?" : "Reject selected costs?"}</AlertDialogTitle><AlertDialogDescription>This will {decision === "approved" ? "approve" : "reject"} all {selectedCostIds.length} pending cost entries across {selectedGroups.length} selected survey event(s).</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel><AlertDialogAction disabled={processing} variant={decision === "rejected" ? "outline" : "success"} onClick={event => { event.preventDefault(); void submitDecision(); }}>{processing ? "Processing…" : decision === "approved" ? "Approve Selected" : "Reject Selected"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
