"use client";

import { Fragment, useMemo, useState } from "react";
import { usePrototypeState } from "@/components/prototype-state";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge, ViewCountBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ListPagination } from "@/components/ui/list-pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { withBasePath } from "@/lib/app-path";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Cost } from "@/types/cost";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";
import type { User, UserRole } from "@/types/user";

type View = "pending" | "history";
type Decision = "approved" | "rejected";
type Target = {
  project: string;
  survey: string;
  supplierProjectId: string;
  jobBookId: string;
  surveyEventId: string;
};

const statusLabels: Record<Cost["status"], string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};
const statusClasses: Record<Cost["status"], string> = {
  pending_approval: "border-orange-200 bg-orange-50 text-orange-900",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

function currency(amount: number, code: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(amount);
}

function dateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function targetFor(
  cost: Cost,
  projects: Map<string, Project>,
  subsamples: Map<string, Subsample>,
): Target {
  if (cost.scope.scopeType === "project") {
    const project = projects.get(cost.scope.projectId);
    return {
      project: project?.name ?? "Project",
      survey: project?.surveyEventId ?? cost.scope.projectId,
      supplierProjectId: cost.supplierProjectId,
      jobBookId: project?.jobBookNumber ?? "—",
      surveyEventId: project?.surveyEventId ?? "—",
    };
  }

  const subsample = subsamples.get(cost.scope.subsampleId);
  const project = subsample ? projects.get(subsample.projectId) : undefined;
  return {
    project: project?.name ?? "Project",
    survey: subsample?.name ?? cost.scope.subsampleId,
    supplierProjectId: cost.supplierProjectId,
    jobBookId: project?.jobBookNumber ?? "—",
    surveyEventId: project?.surveyEventId ?? "—",
  };
}

function StatusBadge({ status }: { status: Cost["status"] }) {
  return (
    <Badge className={`max-w-full whitespace-normal text-center lg:whitespace-nowrap ${statusClasses[status]}`} variant="outline">
      {statusLabels[status]}
    </Badge>
  );
}

function CostProjectName({ name }: { name: string }) {
  return <>
    <Popover>
      <PopoverTrigger asChild><button type="button" title={name} aria-label={`Show full project name: ${name}`} className="block min-h-7 w-full truncate text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden">{name}</button></PopoverTrigger>
      <PopoverContent className="wrap-break-word" align="end">{name}</PopoverContent>
    </Popover>
    <span className="hidden lg:inline">{name}</span>
  </>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-xs sm:grid-cols-[135px_minmax(0,1fr)] sm:gap-3">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className="min-w-0 wrap-break-word font-medium">{value}</dd>
    </div>
  );
}

function CostDetails({
  cost,
  supplierName,
  target,
  users,
}: {
  cost: Cost;
  supplierName: string;
  target: Target;
  users: Map<string, User>;
}) {
  const approver = cost.approval
    ? users.get(cost.approval.decidedByUserId)
    : undefined;
  return (
    <div className="grid gap-x-8 gap-y-5 bg-indigo-50/70 px-4 py-4 sm:grid-cols-2 lg:px-14">
      <div className="min-w-0 space-y-5">
      <section aria-labelledby={`general-${cost.id}`} className="space-y-2">
        <h3
          className="border-b pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
          id={`general-${cost.id}`}
        >
          General
        </h3>
        <dl className="space-y-2">
          <Detail label="Supplier" value={supplierName} />
          <Detail
            label="Supplier Project ID"
            value={target.supplierProjectId}
          />
          <Detail label="Job Book ID" value={target.jobBookId} />
          <Detail label="Survey Event ID" value={target.surveyEventId} />
        </dl>
      </section>
        <section aria-labelledby={`billing-${cost.id}`} className="space-y-2">
          <h3
            className="border-b pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            id={`billing-${cost.id}`}
          >
            Billing
          </h3>
          <dl className="space-y-2">
            <Detail
              label="API Enabled"
              value={cost.apiEnabled ? "On" : "Off"}
            />
            <Detail
              label="Billing Mode"
              value={
                cost.billingMode === "project_level"
                  ? "Project Level"
                  : "Survey Level"
              }
            />
          </dl>
        </section>
      </div>
      <div className="min-w-0 space-y-5">
        <section
          aria-labelledby={`adjustments-${cost.id}`}
          className="space-y-2"
        >
          <h3
            className="border-b pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            id={`adjustments-${cost.id}`}
          >
            Adjustments
          </h3>
          <dl className="space-y-2">
            <Detail
              label="Discount"
              value={currency(cost.discountAmount ?? 0, cost.currency)}
            />
            <Detail
              label="Discount Reason"
              value={cost.discountReason || "—"}
            />
          </dl>
        </section>
        <section aria-labelledby={`approval-${cost.id}`} className="space-y-2">
          <h3
            className="border-b pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            id={`approval-${cost.id}`}
          >
            Approval
          </h3>
          <dl className="space-y-2">
            <Detail label="Published Date" value={dateTime(cost.publishedAt)} />
            <Detail label="Current Status" value={statusLabels[cost.status]} />
            <Detail
              label="Approver"
              value={
                approver ? `${approver.firstName} ${approver.lastName}` : "—"
              }
            />
            <Detail
              label="Approval Date"
              value={dateTime(cost.approval?.decidedAt)}
            />
            <Detail
              label="Approval Details"
              value={cost.approval?.note ?? "—"}
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

export function CostsWorkspace({
  costs: sourceCosts,
  projects,
  subsamples,
  supplierName,
  users,
  userRole,
}: {
  costs: Cost[];
  projects: Project[];
  subsamples: Subsample[];
  supplierName: string;
  users: User[];
  userRole: UserRole;
}) {
  const { empty } = usePrototypeState();
  const costs = useMemo(() => empty ? [] : sourceCosts, [empty, sourceCosts]);
  const router = useRouter();
  const canDecide = userRole === "admin";
  const [view, setView] = useState<View>("pending");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [decision, setDecision] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const projectMap = useMemo(
    () => new Map(projects.map((item) => [item.id, item])),
    [projects],
  );
  const subsampleMap = useMemo(
    () => new Map(subsamples.map((item) => [item.id, item])),
    [subsamples],
  );
  const userMap = useMemo(
    () => new Map(users.map((item) => [item.id, item])),
    [users],
  );
  const countries = [...new Set(costs.map((cost) => cost.country))].sort();
  const pending = costs.filter((cost) => cost.status === "pending_approval");
  const history = costs
    .filter((cost) => cost.status !== "pending_approval")
    .sort((left, right) => {
      const leftDate = left.approval?.decidedAt ?? left.publishedAt ?? "";
      const rightDate = right.approval?.decidedAt ?? right.publishedAt ?? "";
      return rightDate.localeCompare(leftDate);
    });
  const query = search.trim().toLocaleLowerCase();
  const invalidDates =
    view === "history" && Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const rows = (view === "pending" ? pending : history).filter((cost) => {
    if (invalidDates) return false;
    if (status !== "all" && cost.status !== status) return false;
    if (view === "pending" && country !== "all" && cost.country !== country)
      return false;
    const target = targetFor(cost, projectMap, subsampleMap);
    const fields = [
      cost.id,
      cost.country,
      target.project,
      target.survey,
      target.supplierProjectId,
      target.jobBookId,
      target.surveyEventId,
    ];
    if (
      query &&
      !fields.some((field) => field.toLocaleLowerCase().includes(query))
    )
      return false;
    const eventDate = cost.approval?.decidedAt ?? cost.publishedAt;
    if (
      view === "history" &&
      dateFrom &&
      (!eventDate || eventDate.slice(0, 10) < dateFrom)
    )
      return false;
    if (
      view === "history" &&
      dateTo &&
      (!eventDate || eventDate.slice(0, 10) > dateTo)
    )
      return false;
    return true;
  });
  const visibleIds = rows
    .filter((cost) => selectedIds.has(cost.id))
    .map((cost) => cost.id);
  const allSelected =
    rows.length > 0 && rows.every((cost) => selectedIds.has(cost.id));
  const clearSelection = () => setSelectedIds(new Set());
  const selectCost = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const selectVisible = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const cost of rows) {
        if (checked) next.add(cost.id);
        else next.delete(cost.id);
      }
      return next;
    });
  };
  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function submitDecision() {
    if (!decision || visibleIds.length === 0) return;
    setProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(withBasePath("/api/costs/decisions/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, costIds: visibleIds }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message ?? "Unable to update selected costs.");
        return;
      }
      setSuccess(
        `${visibleIds.length} cost record${visibleIds.length === 1 ? "" : "s"} ${decision === "approved" ? "approved" : "rejected"} successfully. The decision is recorded in History.`,
      );
      setDecision(null);
      clearSelection();
      router.refresh();
    } catch {
      setError("Unable to connect to the service. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  function changeView(nextView: string) {
    setView(nextView as View);
    setStatus("all");
    setCountry("all");
    setDateFrom("");
    setDateTo("");
    clearSelection();
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Costs</h1>
        <Tabs onValueChange={changeView} value={view}>
          <TabsList aria-label="Cost views">
            <TabsTrigger value="pending">
              Pending Approval{" "}
              <ViewCountBadge active={view === "pending"} className="ml-2">{pending.length}</ViewCountBadge>
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>


      {success ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-[minmax(220px,1fr)_240px_160px]">
        <div className="relative col-span-2 lg:col-span-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search costs by project, survey ID, or job book"
            className="pl-9"
            onChange={(event) => {
              setSearch(event.target.value);
              clearSelection();
            }}
            placeholder="Search by Project, Survey ID or Job Book..."
            value={search}
          />
        </div>
        {view === "pending" ? (
          <Select
            onValueChange={(value) => {
              setCountry(value);
              clearSelection();
            }}
            value={country}
          >
            <SelectTrigger aria-label="Filter costs by country">
              <SelectValue placeholder="Country: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Country: All</SelectItem>
              {countries.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <DateRangePicker label="Approval date range" value={{ from: dateFrom, to: dateTo }} onChange={(range) => { setDateFrom(range.from); setDateTo(range.to); clearSelection(); }} />
        )}
        <Select
          onValueChange={(value) => {
            setStatus(value);
            clearSelection();
          }}
          value={status}
        >
          <SelectTrigger aria-label="Filter costs by status">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            {view === "pending" ? (
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
            ) : (
              <>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {invalidDates ? (
        <p className="text-sm text-destructive" role="alert">
          Start date must be on or before end date.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
      {canDecide && view === "pending" ? (
        <div aria-live="polite" className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <Badge
              className="rounded-full"
              variant={visibleIds.length ? "default" : "secondary"}
            >
              {visibleIds.length}
            </Badge>
            Selected
          </span>
          <Button
            disabled={!visibleIds.length || processing}
            onClick={() => {
              setError(null);
              setSuccess(null);
              setDecision("approved");
            }}
            type="button"
          >
            Approve Selected
          </Button>
          <Button
            disabled={!visibleIds.length || processing}
            onClick={() => {
              setError(null);
              setSuccess(null);
              setDecision("rejected");
            }}
            type="button"
            variant="outline"
          >
            Reject Selected
          </Button>
        </div>
      ) : null}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button disabled={!rows.length || rows.every((cost) => expandedIds.has(cost.id))} onClick={() => setExpandedIds((current) => new Set([...current, ...rows.map((cost) => cost.id)]))} size="sm" variant="ghost"><ChevronRight aria-hidden="true" className="size-4" />Expand All</Button>
        <Button disabled={!rows.some((cost) => expandedIds.has(cost.id))} onClick={() => setExpandedIds((current) => { const next = new Set(current); rows.forEach((cost) => next.delete(cost.id)); return next; })} size="sm" variant="ghost"><ChevronDown aria-hidden="true" className="size-4" />Collapse All</Button>
        {search.trim() || country !== "all" || status !== "all" || dateFrom || dateTo ? (
          <Button className="h-8 gap-1.5 px-2 text-muted-foreground" onClick={() => { setSearch(""); setCountry("all"); setStatus("all"); setDateFrom(""); setDateTo(""); clearSelection(); }} size="sm" type="button" variant="ghost"><X aria-hidden="true" className="size-3.5" />Clear Filters</Button>
        ) : null}
      </div>
      </div>

      {!rows.length ? (
        <div className="rounded-md border bg-white px-5 py-10 text-center">
          <p className="font-medium">
            {costs.length === 0
              ? "No costs available"
              : query ||
                  country !== "all" ||
                  status !== "all" ||
                  dateFrom ||
                  dateTo
                ? "No costs match these filters"
                : view === "pending"
                  ? "No costs are pending approval"
                  : "No cost history available"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "pending"
              ? "New pending cost records will appear here."
              : "Processed cost records will appear here."}
          </p>
        </div>
      ) : view === "pending" ? (
        <PendingTable
          costs={rows}
          canDecide={canDecide}
          selectedIds={selectedIds}
          allSelected={allSelected}
          onSelect={selectCost}
          onSelectAll={selectVisible}
          expandedIds={expandedIds}
          onExpand={toggleExpanded}
          projects={projectMap}
          subsamples={subsampleMap}
          supplierName={supplierName}
          users={userMap}
        />
      ) : (
        <HistoryTable
          key={JSON.stringify([search, status, dateFrom, dateTo])}
          costs={rows}
          expandedIds={expandedIds}
          onExpand={toggleExpanded}
          projects={projectMap}
          subsamples={subsampleMap}
          supplierName={supplierName}
          users={userMap}
        />
      )}

      <AlertDialog
        open={decision !== null}
        onOpenChange={(open) => {
          if (!open && !processing) setDecision(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decision === "approved"
                ? "Approve selected costs?"
                : "Reject selected costs?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {decision === "approved"
                ? `This will approve ${visibleIds.length} cost record(s).`
                : `This will reject ${visibleIds.length} cost record(s).`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p
              className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={processing}
              onClick={(event) => {
                event.preventDefault();
                void submitDecision();
              }}
              variant={decision === "rejected" ? "outline" : "default"}
            >
              {processing
                ? "Processing…"
                : decision === "approved"
                  ? "Approve Selected"
                  : "Reject Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PendingTable({
  costs,
  canDecide,
  selectedIds,
  allSelected,
  onSelect,
  onSelectAll,
  expandedIds,
  onExpand,
  projects,
  subsamples,
  supplierName,
  users,
}: {
  costs: Cost[];
  canDecide: boolean;
  selectedIds: Set<string>;
  allSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  expandedIds: Set<string>;
  onExpand: (id: string) => void;
  projects: Map<string, Project>;
  subsamples: Map<string, Subsample>;
  supplierName: string;
  users: Map<string, User>;
}) {
  return (
    <div className="border-y">
      {canDecide ? <label className="flex min-h-11 items-center gap-2 border-b px-2 lg:hidden"><Checkbox checked={allSelected} onCheckedChange={(value) => onSelectAll(value === true)} />Select all visible pending costs</label> : null}
      <Table className="block lg:table lg:table-fixed">
        <caption className="sr-only">Costs pending approval</caption>
        <TableHeader className="hidden lg:table-header-group">
          <TableRow>
            {canDecide ? (
              <TableHead className="w-8 px-1 text-center">
                <Checkbox
                  aria-label="Select all visible pending costs"
                  checked={allSelected}
                  onCheckedChange={(value) => onSelectAll(value === true)}
                />
              </TableHead>
            ) : null}
            <TableHead className="w-9 px-0">
              <span className="sr-only">Expand details</span>
            </TableHead>
            <TableHead className="w-36">Status</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Survey / Subsample</TableHead>
            <TableHead className="w-24">Country</TableHead>
            <TableHead className="w-20 text-right">Completes</TableHead>
            <TableHead className="w-20 text-right">CPI</TableHead>
            <TableHead className="w-28 text-right">Total Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="block lg:table-row-group">
          {costs.map((cost) => {
            const target = targetFor(cost, projects, subsamples);
            const expanded = expandedIds.has(cost.id);
            return (
              <Fragment key={cost.id}>
                <TableRow
                  aria-expanded={expanded}
                  className={`grid grid-cols-[44px_repeat(4,minmax(0,1fr))] items-start gap-x-2 py-2 [&>td]:py-1 lg:table-row lg:py-0 lg:[&>td]:py-2 ${selectedIds.has(cost.id) ? "bg-indigo-50" : ""}`}
                >
                  {canDecide ? (
                    <TableCell className="col-start-1 row-span-2 row-start-1 flex h-11 items-center justify-center p-0 lg:table-cell lg:h-auto lg:px-1 lg:py-2 lg:text-center">
                      <Checkbox
                        aria-label={`Select cost for ${target.project}`}
                        checked={selectedIds.has(cost.id)}
                        onCheckedChange={(value) =>
                          onSelect(cost.id, value === true)
                        }
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="col-start-1 row-start-3 flex justify-center p-0 lg:table-cell lg:py-2">
                    <Button
                      aria-label={`${expanded ? "Collapse" : "Expand"} details for ${target.project}`}
                      className="size-11 px-0 lg:size-8"
                      onClick={() => onExpand(cost.id)}
                      size="sm"
                      variant="ghost"
                    >
                      {expanded ? (
                        <ChevronDown aria-hidden="true" className="size-4" />
                      ) : (
                        <ChevronRight aria-hidden="true" className="size-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="col-start-2 col-span-4 row-start-1">
                    <StatusBadge status={cost.status} />
                  </TableCell>
                  <TableCell className="col-start-2 col-span-4 row-start-2 min-w-0 whitespace-normal font-medium wrap-break-word">
                    <CostProjectName name={target.project} />
                    <span className="block text-xs font-normal text-muted-foreground">
                      Event ID: {target.surveyEventId}
                    </span>
                  </TableCell>
                  <TableCell className="col-start-2 col-span-4 row-start-3 min-w-0 whitespace-normal wrap-break-word"><span className="block text-xs text-muted-foreground lg:hidden">Survey / Subsample</span>{target.survey}</TableCell>
                  <TableCell className="col-start-2 row-start-4 min-w-0 whitespace-normal wrap-break-word"><span className="block text-xs text-muted-foreground lg:hidden">Country</span>{cost.country}</TableCell>
                  <TableCell className="col-start-3 row-start-4 min-w-0 whitespace-normal wrap-break-word tabular-nums lg:text-right">
                    <span className="block text-xs text-muted-foreground lg:hidden">Completes</span>{cost.completes}
                  </TableCell>
                  <TableCell className="col-start-4 row-start-4 min-w-0 whitespace-normal wrap-break-word tabular-nums lg:text-right">
                    <span className="block text-xs text-muted-foreground lg:hidden">CPI</span>{currency(cost.cpi, cost.currency)}
                  </TableCell>
                  <TableCell className="col-start-5 row-start-4 min-w-0 whitespace-normal wrap-break-word font-medium tabular-nums lg:text-right"><span className="block text-xs text-muted-foreground lg:hidden">Total Cost</span>
                    {currency(cost.totalCost, cost.currency)}
                  </TableCell>
                </TableRow>
                {expanded ? (
                  <TableRow className="block hover:bg-transparent lg:table-row">
                    <TableCell className="block whitespace-normal p-0 lg:table-cell" colSpan={canDecide ? 9 : 8}>
                      <CostDetails
                        cost={cost}
                        supplierName={supplierName}
                        target={target}
                        users={users}
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function HistoryTable({
  costs,
  expandedIds,
  onExpand,
  projects,
  subsamples,
  supplierName,
  users,
}: {
  costs: Cost[];
  expandedIds: Set<string>;
  onExpand: (id: string) => void;
  projects: Map<string, Project>;
  subsamples: Map<string, Subsample>;
  supplierName: string;
  users: Map<string, User>;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.max(1, Math.ceil(costs.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = costs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  return (
    <div className="space-y-3">
      <div className="border-y">
        <Table className="block lg:table lg:table-fixed">
          <caption className="sr-only">Processed cost history</caption>
          <TableHeader className="hidden lg:table-header-group">
            <TableRow>
              <TableHead className="w-9 px-0">
                <span className="sr-only">Expand details</span>
              </TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Approval Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="block lg:table-row-group">
            {pageRows.map((cost) => {
              const target = targetFor(cost, projects, subsamples);
              const approver = cost.approval
                ? users.get(cost.approval.decidedByUserId)
                : undefined;
              const expanded = expandedIds.has(cost.id);
              return (
                <Fragment key={cost.id}>
                  <TableRow aria-expanded={expanded} className="grid grid-cols-[44px_repeat(4,minmax(0,1fr))] items-start gap-x-2 py-2 [&>td]:py-1 lg:[&>td]:py-2 lg:table-row lg:py-0">
                    <TableCell className="col-start-1 row-start-1 flex justify-center p-0 lg:table-cell lg:py-2">
                      <Button
                        aria-label={`${expanded ? "Collapse" : "Expand"} details for ${target.project}`}
                        className="size-11 px-0 lg:size-8"
                        onClick={() => onExpand(cost.id)}
                        size="sm"
                        variant="ghost"
                      >
                        {expanded ? (
                          <ChevronDown aria-hidden="true" className="size-4" />
                        ) : (
                          <ChevronRight aria-hidden="true" className="size-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="col-start-2 col-span-4 row-start-1">
                      <StatusBadge status={cost.status} />
                    </TableCell>
                    <TableCell className="col-start-2 col-span-4 row-start-2 min-w-0 whitespace-normal font-medium wrap-break-word">
                      <CostProjectName name={target.project} />
                      <span className="block text-xs font-normal text-muted-foreground lg:hidden">Event ID: {target.surveyEventId}</span>
                      <span className="hidden text-xs font-normal text-muted-foreground lg:block">{target.survey}</span>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal font-medium tabular-nums lg:table-cell"><span className="block text-xs text-muted-foreground lg:hidden">Amount</span>
                      {currency(cost.totalCost, cost.currency)}
                    </TableCell>
                    <TableCell className="col-start-2 col-span-2 row-start-5 whitespace-normal wrap-break-word">
                      <span className="block text-xs text-muted-foreground lg:hidden">Approver</span>{approver
                        ? `${approver.firstName} ${approver.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell className="col-start-4 col-span-2 row-start-5 whitespace-normal wrap-break-word">
                      <span className="block text-xs text-muted-foreground lg:hidden">Approval Date</span>{dateTime(cost.approval?.decidedAt ?? cost.publishedAt)}
                    </TableCell>
                    <TableCell className="col-start-2 col-span-4 row-start-3 min-w-0 whitespace-normal wrap-break-word lg:hidden"><span className="block text-xs text-muted-foreground">Survey / Subsample</span>{target.survey}</TableCell>
                    <TableCell className="col-start-2 row-start-4 min-w-0 whitespace-normal wrap-break-word lg:hidden"><span className="block text-xs text-muted-foreground">Country</span>{cost.country}</TableCell>
                    <TableCell className="col-start-3 row-start-4 min-w-0 whitespace-normal wrap-break-word lg:hidden"><span className="block text-xs text-muted-foreground">Completes</span>{cost.completes}</TableCell>
                    <TableCell className="col-start-4 row-start-4 min-w-0 whitespace-normal wrap-break-word lg:hidden"><span className="block text-xs text-muted-foreground">CPI</span>{currency(cost.cpi, cost.currency)}</TableCell>
                    <TableCell className="col-start-5 row-start-4 min-w-0 whitespace-normal wrap-break-word lg:hidden"><span className="block text-xs text-muted-foreground">Total Cost</span>{currency(cost.totalCost, cost.currency)}</TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow className="block hover:bg-transparent lg:table-row">
                      <TableCell className="block whitespace-normal p-0 lg:table-cell" colSpan={6}>
                        <CostDetails
                          cost={cost}
                          supplierName={supplierName}
                          target={target}
                          users={users}
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <ListPagination total={costs.length} noun="costs" page={currentPage} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
    </div>
  );
}
