"use client";

import { Fragment, useMemo, useState } from "react";
import { PrototypeEmptyNotice, usePrototypeState } from "@/components/prototype-state";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
    <Badge className={statusClasses[status]} variant="outline">
      {statusLabels[status]}
    </Badge>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-xs sm:grid-cols-[135px_minmax(0,1fr)] sm:gap-3">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className="wrap-break-word font-medium">{value}</dd>
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
      <div className="space-y-5">
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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Costs</h1>
        <Tabs onValueChange={changeView} value={view}>
          <TabsList aria-label="Cost views">
            <TabsTrigger value="pending">
              Pending Approval{" "}
              <Badge className="ml-2" variant="secondary">
                {pending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <PrototypeEmptyNotice module="Costs" />

      {success ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_160px_160px]">
        <div className="relative">
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
          <>
            <label className="sr-only" htmlFor="cost-date-from">
              Approval date from
            </label>
            <Input
              aria-label="Approval date from"
              id="cost-date-from"
              onChange={(event) => {
                setDateFrom(event.target.value);
                clearSelection();
              }}
              type="date"
              value={dateFrom}
            />
          </>
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
        {view === "history" ? (
          <>
            <label className="sr-only" htmlFor="cost-date-to">
              Approval date to
            </label>
            <Input
              aria-label="Approval date to"
              id="cost-date-to"
              onChange={(event) => {
                setDateTo(event.target.value);
                clearSelection();
              }}
              type="date"
              value={dateTo}
            />
          </>
        ) : null}
      </div>

      {invalidDates ? (
        <p className="text-sm text-destructive" role="alert">
          Start date must be on or before end date.
        </p>
      ) : null}
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
      <Table>
        <caption className="sr-only">Costs pending approval</caption>
        <TableHeader>
          <TableRow>
            {canDecide ? (
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all visible pending costs"
                  checked={allSelected}
                  onCheckedChange={(value) => onSelectAll(value === true)}
                />
              </TableHead>
            ) : null}
            <TableHead className="w-8">
              <span className="sr-only">Expand details</span>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Survey / Subsample</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Completes</TableHead>
            <TableHead className="text-right">CPI</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costs.map((cost) => {
            const target = targetFor(cost, projects, subsamples);
            const expanded = expandedIds.has(cost.id);
            return (
              <Fragment key={cost.id}>
                <TableRow
                  aria-expanded={expanded}
                  className={selectedIds.has(cost.id) ? "bg-indigo-50" : ""}
                >
                  {canDecide ? (
                    <TableCell>
                      <Checkbox
                        aria-label={`Select cost for ${target.project}`}
                        checked={selectedIds.has(cost.id)}
                        onCheckedChange={(value) =>
                          onSelect(cost.id, value === true)
                        }
                      />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <Button
                      aria-label={`${expanded ? "Collapse" : "Expand"} details for ${target.project}`}
                      className="size-7 px-0"
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
                  <TableCell>
                    <StatusBadge status={cost.status} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {target.project}
                    <span className="block text-xs font-normal text-muted-foreground">
                      Event ID: {target.surveyEventId}
                    </span>
                  </TableCell>
                  <TableCell>{target.survey}</TableCell>
                  <TableCell>{cost.country}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {cost.completes}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currency(cost.cpi, cost.currency)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {currency(cost.totalCost, cost.currency)}
                  </TableCell>
                </TableRow>
                {expanded ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="p-0" colSpan={canDecide ? 9 : 8}>
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
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(costs.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = costs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  return (
    <div className="space-y-3">
      <div className="border-y">
        <Table>
          <caption className="sr-only">Processed cost history</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <span className="sr-only">Expand details</span>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Approval Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((cost) => {
              const target = targetFor(cost, projects, subsamples);
              const approver = cost.approval
                ? users.get(cost.approval.decidedByUserId)
                : undefined;
              const expanded = expandedIds.has(cost.id);
              return (
                <Fragment key={cost.id}>
                  <TableRow aria-expanded={expanded}>
                    <TableCell>
                      <Button
                        aria-label={`${expanded ? "Collapse" : "Expand"} details for ${target.project}`}
                        className="size-7 px-0"
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
                    <TableCell>
                      <StatusBadge status={cost.status} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {target.project}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {target.survey}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {currency(cost.totalCost, cost.currency)}
                    </TableCell>
                    <TableCell>
                      {approver
                        ? `${approver.firstName} ${approver.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {dateTime(cost.approval?.decidedAt ?? cost.publishedAt)}
                    </TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="p-0" colSpan={6}>
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
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {currentPage} of {pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
