import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export function CostsPanel({ costs }: { costs: Cost[] }) {
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
              label="Discounts"
              value={currency(cost.discountAmount ?? 0, cost.currency)}
            />
          </dl>
          <Card className="gap-0 py-0 shadow-none">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Cost Status</p>
                <Badge variant="outline">{costStatusLabel[cost.status]}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Supplier Status</p>
                <Badge variant="outline">
                  {cost.supplierStatus
                    ? supplierStatusLabel[cost.supplierStatus]
                    : "Not provided"}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Ipsos Status</p>
                <Badge variant="outline">
                  {cost.ipsosStatus
                    ? ipsosStatusLabel[cost.ipsosStatus]
                    : "Not provided"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      ))}
      <p className="text-sm text-muted-foreground">
        Cost approval and status changes are managed in Costs.
      </p>
    </div>
  );
}
