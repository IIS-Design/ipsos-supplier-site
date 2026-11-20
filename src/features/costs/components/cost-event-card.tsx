"use client";

import Link from "next/link";
import styles from "@/components/ui/surface-gradient.module.css";
import { getCostBreakdown } from "@/features/costs/cost-breakdown";
import { formatSubsampleId } from "@/lib/subsample-id";

import { ChevronDown, ChevronRight, Folder, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Cost } from "@/types/cost";
import type { User } from "@/types/user";
import type { CostGroup } from "@/features/costs/cost-groups";
import { CountryFlag } from "@/components/ui/country-flag";
import type { ReactNode } from "react";

export const costStatusLabels = { pending_approval: "Pending Approval", approved: "Approved", rejected: "Rejected" };
const statusClasses = { pending_approval: "border-orange-200 bg-orange-50 text-orange-900", approved: "border-emerald-200 bg-emerald-50 text-emerald-800", rejected: "border-rose-200 bg-rose-50 text-rose-800" };
export function money(amount: number, code: string) {
  return `${new Intl.NumberFormat("en-US", { style: "currency", currency: code, currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${code}`;
}
function dateTime(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function Status({ status }: { status: Cost["status"] }) {
  return <Badge variant="outline" className={statusClasses[status]}>{costStatusLabels[status]}</Badge>;
}
function NotAvailable() { return <span className="font-normal text-muted-foreground">N/A</span>; }
function Metric({ value, field, unit }: { value?: number; field?: number; unit: string }) {
  return <><span>{value == null ? <NotAvailable /> : `${value}${unit}`}</span>{field != null && <span className="mt-1 block text-xs text-muted-foreground">Field: {field}{unit}{value != null ? ` (${field - value > 0 ? "+" : ""}${Number((field - value).toFixed(2))}${unit})` : ""}</span>}</>;
}
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 wrap-break-word text-foreground">{children}</dd></div>;
}
function Reason({ label, reason }: { label: string; reason?: string }) {
  if (!reason) return null;
  return <Popover><PopoverTrigger asChild><Button type="button" variant="ghost" size="sm" className="size-7 shrink-0 p-0 text-muted-foreground" aria-label={label}><Info className="size-3.5" aria-hidden="true" /></Button></PopoverTrigger><PopoverContent className="w-60 space-y-0.5 p-3 text-xs leading-relaxed"><p className="font-medium text-muted-foreground">{label}</p><p className="wrap-break-word text-foreground">{reason}</p></PopoverContent></Popover>;
}
type MetadataField = { label: string; value: ReactNode };
const uniqueValues = (values: string[]) => [...new Set(values)].join(", ");
function recordMetadata(records: Cost[], users: User[], history: boolean): MetadataField[] {
  const fields = [
    { label: "Supplier Project ID", value: uniqueValues(records.map(cost => cost.supplierProjectId || "N/A")) || "N/A" },
    { label: "API Enabled", value: uniqueValues(records.map(cost => cost.apiEnabled ? "On" : "Off")) || "N/A" },
    { label: "Published Date", value: uniqueValues(records.map(cost => dateTime(cost.publishedAt))) || "N/A" },
  ];
  if (history) {
    fields.push(
      { label: "Approver", value: uniqueValues(records.map(cost => { const user = users.find(item => item.id === cost.approval?.decidedByUserId); return user ? `${user.firstName} ${user.lastName}` : "N/A"; })) || "N/A" },
      { label: "Approval Date", value: uniqueValues(records.map(cost => dateTime(cost.approval?.decidedAt))) || "N/A" },
      { label: "Approval Details", value: uniqueValues(records.map(cost => cost.approval?.note || "N/A")) || "N/A" },
    );
  }
  return fields;
}
function Metadata({ fields }: { fields: MetadataField[] }) {
  if (!fields.length) return null;
  return <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">{fields.map(field => <div key={field.label} className="min-w-0 wrap-break-word"><dt className="inline text-muted-foreground">{field.label}: </dt><dd className={`inline align-middle ${typeof field.value === "string" && field.value === "N/A" ? "text-muted-foreground" : "text-foreground"}`}>{field.value}</dd></div>)}</dl>;
}
function EntryTable({ records, users, history }: { records: Cost[]; users: User[]; history: boolean }) {
  const subsampleMetadata = recordMetadata(records, users, history);
  return <div className="divide-y">{records.map(cost => {
    // Metadata shared by an event or subsample stays next to that level's name.
    const entryMetadata = recordMetadata([cost], users, history).filter(field => field.label !== "API Enabled" && subsampleMetadata.find(item => item.label === field.label)?.value !== field.value);
    return <div key={cost.id} className="min-w-0 py-2">
      <dl className="flex flex-wrap items-start gap-x-8 gap-y-3 text-sm">
        <Detail label="Completes">{cost.completes.toLocaleString("en")}{cost.completesPercentage != null && <span className="ml-1 text-xs text-muted-foreground">({cost.completesPercentage}%)</span>}</Detail>
        <Detail label="CPI">{money(cost.cpi, cost.currency)}</Detail>
        <Detail label="Incidence"><Metric value={cost.incidence} field={cost.fieldIncidence} unit="%" /></Detail>
        <Detail label="LOI"><Metric value={cost.loi} field={cost.fieldLoi} unit=" min" /></Detail>
        {!!cost.discountAmount && <Detail label="Discount"><span className="inline-flex items-center gap-1">{money(cost.discountAmount, cost.currency)}<Reason label="Discount reason" reason={cost.discountReason} /></span></Detail>}
      </dl>
      <Metadata fields={entryMetadata} />
    </div>;
  })}</div>;
}

export function CostEventCard({ group, open, onOpenChange, expandedIds, onToggleSubsample, selected, onSelect, canSelect, users, history, supplierName }: {
  group: CostGroup; open: boolean; onOpenChange: (open: boolean) => void; expandedIds: Set<string>;
  onToggleSubsample: (id: string) => void; selected: boolean; onSelect: (checked: boolean) => void;
  canSelect: boolean; users: User[]; history: boolean; supplierName: string;
}) {
  const name = group.project?.name ?? "Unavailable survey event";
  const statuses = [...new Set(group.records.map(cost => cost.status))];
  const jobs = group.jobBookNumbers;
  const breakdowns = getCostBreakdown(group.records);
  const projectMetadata = recordMetadata(group.projectCosts.length ? group.projectCosts : group.records, users, history);

  return <li className={`${styles.card} min-w-0 rounded-md border px-3 py-1 ${selected ? "border-indigo-300 ring-1 ring-indigo-200" : "border-border"}`}>
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="flex items-start gap-1 py-2.5">
        {canSelect && <label className="flex size-9 shrink-0 items-center justify-center"><Checkbox aria-label={`Select all pending costs for ${name}`} checked={selected} onCheckedChange={checked => onSelect(checked === true)} /></label>}
        <CollapsibleTrigger asChild><Button aria-label={`${open ? "Collapse" : "Expand"} costs for ${name}`} className="mt-0.5 size-7 shrink-0 px-0" size="sm" variant="ghost">{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</Button></CollapsibleTrigger>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1 basis-56"><h2 className="wrap-break-word text-lg font-normal leading-6"><span className="text-muted-foreground">Project: </span>{group.project ? <Link href={`/projects/${group.project.id}`} className="text-foreground underline-offset-4 hover:text-primary hover:underline">{name}</Link> : name}</h2><Metadata fields={[
              { label: "SID", value: group.project?.surveyEventId ?? "N/A" },
              { label: "JBN", value: jobs.join(", ") || "N/A" },
              ...projectMetadata.filter(field => field.label === "Published Date"),
              ...projectMetadata.filter(field => field.label !== "Published Date" && field.label !== "Supplier Project ID"),
              { label: "Supplier", value: supplierName },
              ...projectMetadata.filter(field => field.label === "Supplier Project ID"),
              { label: "Billing Entity", value: group.project?.billingEntity || "N/A" },
            ]} /><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">{group.subsamples.length > 0 && <CollapsibleTrigger asChild><button type="button" aria-label={`${open ? "Collapse" : "Expand"} subsample costs for ${name}`} className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm hover:text-primary"><Folder className="size-3.5" aria-hidden="true" />{group.subsamples.length} Subsamples</button></CollapsibleTrigger>}<span>{group.records.length} cost {group.records.length === 1 ? "entry" : "entries"}</span></div></div>
            <div className="flex flex-wrap gap-1">{statuses.map(status => <Status key={status} status={status} />)}</div>
            <div className="space-y-0.5 text-right"><span className="block text-xs leading-tight text-muted-foreground">Total Cost</span>{breakdowns.map(item => <Popover key={item.currency}><PopoverTrigger asChild><button type="button" className="block min-h-5 w-full rounded-sm text-right font-bold leading-tight tabular-nums underline decoration-dotted underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Show cost breakdown for ${name}, ${item.currency}`}>{money(item.total, item.currency)}</button></PopoverTrigger><PopoverContent align="end" className="w-72 space-y-2 p-3 text-xs">
              <h3 className="font-medium">Cost breakdown</h3>
              <dl className="space-y-1.5"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Sample</dt><dd className="tabular-nums">{money(item.sample, item.currency)}</dd></div>
                {item.minimumFee != null && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Min Fee</dt><dd className="tabular-nums">+{money(item.minimumFee, item.currency)}</dd></div>}
                {item.otherFees != null && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Other Fees</dt><dd className="tabular-nums">+{money(item.otherFees, item.currency)}</dd></div>}
                {!!item.discount && <div><dt className="sr-only">Discount</dt><dd><details className="group/discount"><summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden"><span className="inline-flex items-center gap-1 text-muted-foreground">Discount<ChevronDown aria-hidden="true" className="size-3.5 transition-transform group-open/discount:rotate-180" /></span><span className="text-destructive tabular-nums">−{money(item.discount, item.currency)}</span></summary><p className="pt-1 text-xs text-foreground">{uniqueValues(group.records.filter(cost => cost.currency === item.currency && cost.scope.scopeType === "project").map(cost => cost.discountReason || "").filter(Boolean)) || "No discount reason provided."}</p></details></dd></div>}
                <div className="flex justify-between gap-4 border-t pt-2 font-bold"><dt className="text-muted-foreground">Total</dt><dd className="tabular-nums">{money(item.total, item.currency)}</dd></div>
              </dl>
            </PopoverContent></Popover>)}</div>
          </div>
          
        </div>
      </div>
      <CollapsibleContent>
        <div className="pb-3 pl-2 pr-1 sm:pl-8">
          <div className={canSelect ? "mb-3 pl-16 sm:pl-10" : "mb-3 pl-6 sm:pl-0"}>
            {breakdowns.map(item => <dl key={item.currency} className="flex flex-wrap items-start gap-x-8 gap-y-3 pt-2 pb-0 text-sm">
              <Detail label="Total Completes"><span className="font-medium tabular-nums">{item.completes.toLocaleString("en")}</span></Detail>
              <Detail label="Avg CPI"><span className="font-medium tabular-nums">{item.averageCpi == null ? <NotAvailable /> : money(item.averageCpi, item.currency)}</span></Detail>
              <Detail label="Min Fee"><span className="font-medium tabular-nums">{item.minimumFee == null ? <NotAvailable /> : money(item.minimumFee, item.currency)}</span></Detail>
              <Detail label="Other Fees"><span className="inline-flex items-center gap-1 font-medium tabular-nums">{item.otherFees == null ? <NotAvailable /> : money(item.otherFees, item.currency)}<Reason label="Other fees reason" reason={uniqueValues(group.projectCosts.filter(cost => cost.currency === item.currency).map(cost => cost.otherFeesReason || "").filter(Boolean))} /></span></Detail>
              <Detail label="Discount"><span className="inline-flex items-center gap-1 font-medium tabular-nums">{item.discount == null ? <NotAvailable /> : money(item.discount, item.currency)}<Reason label="Discount reason" reason={uniqueValues(group.records.filter(cost => cost.currency === item.currency).map(cost => cost.discountReason || "").filter(Boolean))} /></span></Detail>
            </dl>)}

          </div>
          <ul className="space-y-2" aria-label={`Subsample costs for ${name}`}>
            {group.subsamples.map(item => {
              const id = `${group.id}/subsample/${item.id}`;
              const subsampleOpen = expandedIds.has(id);
              const subsample = item.subsample;
              const localMetadata = recordMetadata(item.records, users, history).filter(field => field.label !== "API Enabled" && projectMetadata.find(parent => parent.label === field.label)?.value !== field.value);

              const totals = new Map<string, number>();
              item.records.forEach(cost => totals.set(cost.currency, (totals.get(cost.currency) ?? 0) + cost.totalCost));
              return <li className="relative min-w-0 rounded-md border border-border/60 bg-white p-3 pb-2.5" key={id}>
                <Collapsible open={subsampleOpen} onOpenChange={() => onToggleSubsample(id)}>
                  <div className="flex items-start gap-1"><CollapsibleTrigger asChild><Button className="size-7 shrink-0 px-0" variant="ghost" size="sm" aria-label={`${subsampleOpen ? "Collapse" : "Expand"} CPI entries for ${subsample?.name ?? item.id}`}>{subsampleOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</Button></CollapsibleTrigger>
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1"><h3 className="min-w-0 wrap-break-word text-base font-medium">{subsample ? <Link href={`/projects/${subsample.projectId}/subsamples/${subsample.id}/details/`} className="text-foreground underline-offset-4 hover:text-primary hover:underline">{subsample.name}</Link> : item.id}</h3><div>{[...totals].map(([code, total]) => <p className="text-sm tabular-nums" key={code}>{money(total, code)}</p>)}</div></div><Metadata fields={[
                      { label: "Country", value: (subsample?.country ?? item.records[0]?.country) ? <span className="inline-flex items-center gap-1.5"><CountryFlag country={subsample?.country ?? item.records[0]?.country ?? ""} /><span>{subsample?.country ?? item.records[0]?.country}</span></span> : "N/A" },
                      { label: "Subsample ID", value: formatSubsampleId(subsample ?? item.id) },
                      ...(subsample?.jobBookNumber && jobs.length > 1 ? [{ label: "Job Book", value: subsample.jobBookNumber }] : []),
                      { label: "Sample Type", value: subsample?.sampleType ?? "N/A" },
                      { label: "Last Status Update", value: dateTime(subsample?.lastStatusUpdatedAt) },
                      ...(item.records.length ? localMetadata : []),
                    ]} /></div>
                  </div>
                  <CollapsibleContent className="pl-1 sm:pl-8"><EntryTable records={item.records} users={users} history={history} /></CollapsibleContent>
                </Collapsible>
              </li>;
            })}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </li>;
}
