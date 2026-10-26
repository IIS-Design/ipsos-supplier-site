import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Subsample } from "@/types/subsample";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function FieldProgressPanel({ subsample }: { subsample: Subsample }) {
  const quotas = subsample.quotaBreakdown ?? [];

  return (
    <div className="space-y-8">
      <section aria-labelledby="field-progress-heading">
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="field-progress-heading"
        >
          Field Progress
        </h2>
        <dl className="mt-4 grid gap-4 border-b pb-5 sm:grid-cols-3">
          <Metric
            label="Achieved Completes"
            value={subsample.achievedCompletes}
          />
          <Metric
            label="Exclusive Remaining"
            value={subsample.exclusiveRemaining}
          />
          <Metric label="Shared Remaining" value={subsample.sharedRemaining} />
        </dl>
      </section>

      <section aria-labelledby="field-metrics-heading">
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="field-metrics-heading"
        >
          Field Metrics
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <Metric label="Incidence" value={`${subsample.incidence}%`} />
          <Metric label="Visitors" value={subsample.visitors} />
          <Metric label="LOI" value={`${subsample.loi} min`} />
        </dl>
      </section>

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
