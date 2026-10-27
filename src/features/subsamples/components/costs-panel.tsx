"use client";

import { usePrototypeState } from "@/components/prototype-state";



import type { SubsampleId } from "@/types/ids";
import type { Cost, IpsosCostStatus, SupplierCostStatus } from "@/types/cost";

const costStatusLabel: Record<Cost["status"], string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

const ipsosStatusLabel: Record<IpsosCostStatus, string> = {
  pending: "Pending",
  published: "Published",
  rejected: "Rejected",
};

const supplierStatusLabel: Record<SupplierCostStatus, string> = {
  default: "Default",
  submitted: "Submitted",
};

function currency(value: number, code: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(value);
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function CostsPanel({ costs: original }: { costs: Cost[] }) {
  const { scenario } = usePrototypeState();
  const sample: Cost = { id: "preview-cost" as Cost["id"], supplierId: "preview-supplier" as Cost["supplierId"], scope: { scopeType: "subsample", subsampleId: "preview-subsample" as SubsampleId } as Cost["scope"], completes: 50, cpi: 5, totalCost: 250, currency: "USD", status: "approved", country: "Romania", supplierProjectId: "1046192", billingMode: "survey_level", apiEnabled: true, discountAmount: 0, supplierStatus: "default", ipsosStatus: "published", publishedAt: "2026-10-20T09:30:00Z" };
  if (scenario === "discounted") Object.assign(sample, { discountAmount: 25, discountReason: "API discount", totalCost: 225 });
  if (scenario === "pending") Object.assign(sample, { status: "pending_approval", supplierStatus: "submitted", ipsosStatus: "pending", publishedAt: undefined });
  if (scenario === "rejected") Object.assign(sample, { status: "rejected", supplierStatus: "submitted", ipsosStatus: "rejected", publishedAt: undefined });
  const costs = scenario === "empty" ? [] : scenario ? [sample] : original;
  if (costs.length === 0) {
    return (
      <section aria-labelledby="cost-summary-heading" className="space-y-4">
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="cost-summary-heading"
        >
          Costs Summary
        </h2>
        <p className="rounded-md border px-4 py-8 text-center text-sm text-muted-foreground">
          No cost summary is available for this subsample.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-md border px-4 py-3 text-sm text-muted-foreground">Survey costs for this subsample. Additional fees and discounts are reflected after costs are published.</p>
      {costs.map((cost) => (
        <section
          aria-labelledby={`cost-${cost.id}-heading`}
          className="space-y-4"
          key={cost.id}
        >
          <h2
            className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
            id={`cost-${cost.id}-heading`}
          >
            Costs Summary
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric label="Completes" value={String(cost.completes)} />
            <SummaryMetric
              label="CPI"
              value={currency(cost.cpi, cost.currency)}
            />
            <SummaryMetric
              label="Total Cost"
              value={currency(cost.totalCost, cost.currency)}
            />
            <SummaryMetric
              label="API Discount"
              value={currency(cost.discountAmount ?? 0, cost.currency)}
            />
          </dl>
          <dl className="space-y-6">
            <div><dt className="text-sm font-medium">Supplier Status</dt><dd className="mt-1 text-sm text-muted-foreground">{cost.supplierStatus ? supplierStatusLabel[cost.supplierStatus] : "Not provided"}</dd></div>
            <div><dt className="text-sm font-medium">Ipsos Status</dt><dd className="mt-1 text-sm text-muted-foreground">{cost.ipsosStatus ? ipsosStatusLabel[cost.ipsosStatus] : "Not provided"}</dd>{cost.publishedAt && <dd className="mt-1 text-xs text-muted-foreground">Published {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(cost.publishedAt))} UTC</dd>}</div>
            <div><dt className="text-sm font-medium">Cost Status</dt><dd className="mt-1 text-sm text-muted-foreground">{costStatusLabel[cost.status]}</dd></div>
          </dl>
        </section>
      ))}
    </div>
  );
}
