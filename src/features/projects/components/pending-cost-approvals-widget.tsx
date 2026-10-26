import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

function getScopeName(
  cost: Cost,
  projectById: Map<string, Project>,
  subsampleById: Map<string, Subsample>,
): string {
  if (cost.scope.scopeType === "project") {
    return projectById.get(cost.scope.projectId)?.name ?? "Project";
  }
  return subsampleById.get(cost.scope.subsampleId)?.name ?? "Subsample";
}

export function PendingCostApprovalsWidget({
  costs,
  projects,
  subsamples,
}: PendingCostApprovalsWidgetProps) {
  const pendingCosts = costs.filter(
    (cost) => cost.status === "pending_approval",
  );
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const subsampleById = new Map(
    subsamples.map((subsample) => [subsample.id, subsample]),
  );

  return (
    <Card className="gap-0 rounded-none border-0 py-0 shadow-none">
      <CardHeader className="gap-1 px-4 pb-1 pt-2">
        <CardTitle>
          <h2 className="text-base font-semibold">Pending Cost Approvals</h2>
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          {pendingCosts.length > 0 ? (
            <Badge
              className="border-orange-200 bg-orange-50 text-orange-900"
              variant="outline"
            >
              {pendingCosts.length} Pending
            </Badge>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent className="px-4 py-0">
        {pendingCosts.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-sm font-medium">No costs are pending approval</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New pending cost items will appear here.
            </p>
          </div>
        ) : (
          <ul aria-label="Pending cost approvals">
            {pendingCosts.slice(0, 10).map((cost, index) => (
              <li key={cost.id}>
                {index > 0 ? <Separator /> : null}
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium leading-5" title={getScopeName(cost, projectById, subsampleById)}>
                      {getScopeName(cost, projectById, subsampleById)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cost.completes} completes · CPI{" "}
                      {formatCurrency(cost.cpi, cost.currency)}
                    </p>
                  </div>
                  <p className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums">
                    {formatCurrency(cost.totalCost, cost.currency)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <div className="border-t px-4 py-2.5">
        <Button asChild size="sm" variant="outline"><Link href="/costs">Review Costs</Link></Button>
      </div>
    </Card>
  );
}
