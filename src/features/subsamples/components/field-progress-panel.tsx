"use client";

import { usePrototypeState } from "@/components/prototype-state";
import { ScenarioEmpty } from "./scenario-preview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReactNode } from "react";
import type { Subsample } from "@/types/subsample";

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-3xl font-medium tabular-nums">{value}</dd>
    </div>
  );
}

export function FieldProgressPanel({ subsample: original }: { subsample: Subsample }) {
  const { scenario } = usePrototypeState();
  if (scenario === "empty") return <ScenarioEmpty title="No field progress yet" message="Metrics will appear when fieldwork starts." />;
  const subsample = { ...original };
  if (scenario === "healthy") Object.assign(subsample, { visitors: 1250, achievedCompletes: 50, incidence: 40, loi: 4.2, exclusiveRemaining: 10, sharedRemaining: 40, quotaBreakdown: [{ quotaGroup: "Age 18–29", achieved: 20, exclusiveRemaining: 5, sharedRemaining: 20 }, { quotaGroup: "Age 30–55", achieved: 30, exclusiveRemaining: 5, sharedRemaining: 20 }] });
  if (scenario === "low") Object.assign(subsample, { visitors: 2000, achievedCompletes: 10, incidence: 0.5, exclusiveRemaining: 40, sharedRemaining: 50, quotaBreakdown: [] });
  if (scenario === "nearly") Object.assign(subsample, { visitors: 1500, achievedCompletes: 98, incidence: 35, exclusiveRemaining: 0, sharedRemaining: 2, quotaBreakdown: [{ quotaGroup: "Overall target", achieved: 98, exclusiveRemaining: 0, sharedRemaining: 2 }] });
  if (scenario === "no-quota") subsample.quotaBreakdown = [];
  const quotas = subsample.quotaBreakdown ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section aria-labelledby="field-progress-heading">
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="field-progress-heading"
        >
          Field Progress
        </h2>
        <dl className="mt-5">
          {[
            ["Achieved Completes", subsample.achievedCompletes],
            ["Exclusive Remaining", subsample.exclusiveRemaining],
            ["Shared Remaining", subsample.sharedRemaining],
          ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b px-2 py-3 last:border-b-0">
            <dt className="text-sm font-medium">{label}</dt>
            <dd className="text-sm tabular-nums text-muted-foreground">{value}</dd>
          </div>)}
        </dl>
      </section>

      <section aria-labelledby="field-metrics-heading" className="min-w-0 border-t pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="field-metrics-heading"
        >
          Field Metrics
        </h2>
        <dl className="mt-8 grid grid-cols-3 gap-4">
          <Metric label="Visitors" value={subsample.visitors} />
          <Metric label="Incidence" value={<>{subsample.incidence}<span className="text-sm font-normal text-muted-foreground">%</span></>} />
          <Metric label="LOI" value={<>{subsample.loi}<span className="text-sm font-normal text-muted-foreground"> min</span></>} />
        </dl>
      </section>

      </div>

      <section aria-labelledby="quota-breakdown-heading" className="space-y-3">
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="quota-breakdown-heading"
        >
          Quota Breakdown
        </h2>
        {quotas.length === 0 ? (
          <p className="rounded-md border px-4 py-6 text-sm text-muted-foreground">
            No quota breakdown is available for this subsample.
          </p>
        ) : (
          <Table>
            <caption className="sr-only">
              Quota achievement and remaining counts
            </caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Quota Group</TableHead>
                <TableHead className="text-right" scope="col">
                  Achieved
                </TableHead>
                <TableHead className="text-right" scope="col">
                  Exclusive Remaining
                </TableHead>
                <TableHead className="text-right" scope="col">
                  Shared Remaining
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotas.map((quota) => (
                <TableRow key={quota.quotaGroup}>
                  <TableCell className="font-medium">
                    {quota.quotaGroup}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quota.achieved}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quota.exclusiveRemaining}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quota.sharedRemaining}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
