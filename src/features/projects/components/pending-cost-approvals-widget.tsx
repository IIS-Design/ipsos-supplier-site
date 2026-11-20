import Link from "next/link";
import { costsForView, groupCosts } from "@/features/costs/cost-groups";
import { getCostBreakdown } from "@/features/costs/cost-breakdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Cost } from "@/types/cost";
import type { Project } from "@/types/project";
import type { Subsample } from "@/types/subsample";

type PendingCostApprovalsWidgetProps = {
  costs: Cost[];
  projects: Project[];
  subsamples: Subsample[];
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function PendingCostApprovalsWidget({
  costs,
  projects,
  subsamples,
}: PendingCostApprovalsWidgetProps) {
  const pendingGroups = groupCosts(costsForView(costs, "pending"), projects, subsamples);

  return (
    <Card className="gap-0 rounded-none border-0 bg-transparent py-0 shadow-none">
      <CardHeader className="gap-1 px-2 pb-2 pt-2">
        <CardTitle>
          <h2 className="flex flex-wrap items-center gap-1.5 text-base font-semibold">
            <Badge className="border-orange-200 bg-orange-50 text-base font-semibold text-orange-900" variant="outline">{pendingGroups.length}</Badge>
            <span>Pending Approvals</span>
          </h2>
        </CardTitle>
        {pendingGroups.length > 0 && <p className="text-xs text-muted-foreground">Showing {Math.min(10, pendingGroups.length)} of {pendingGroups.length} pending events</p>}
      </CardHeader>
      <CardContent className="px-2 py-0">
        {pendingGroups.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-sm font-medium">No costs are pending approval</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New pending cost items will appear here.
            </p>
          </div>
        ) : (
          <ul aria-label="Pending cost approvals" className="space-y-1 pb-2">
            {pendingGroups.slice(0, 10).map((group) => (
              <li key={group.id} className="rounded-md border border-border/60 bg-white px-2 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-5" title={group.project?.name ?? "Unavailable survey event"}>
                      <Link href="/costs" className="hover:text-primary hover:underline underline-offset-4">{group.project?.name ?? "Unavailable survey event"}</Link>
                    </p>
                    <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                      {group.subsamples.length} {group.subsamples.length === 1 ? "subsample" : "subsamples"} · {group.records.length} cost {group.records.length === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm font-semibold tabular-nums">
                    {getCostBreakdown(group.records).map(total => <p key={total.currency}>{formatCurrency(total.total, total.currency)} <span className="text-xs font-normal">{total.currency}</span></p>)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <div className="px-2 py-2.5">
        <Button asChild size="sm" variant="success"><Link href="/costs">Review All Costs</Link></Button>
      </div>
    </Card>
  );
}
