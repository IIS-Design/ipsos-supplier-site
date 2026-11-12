"use client";

import { usePrototypeState } from "@/components/prototype-state";
import { ScenarioEmpty } from "./scenario-preview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fieldMetricRows, metricDifference } from "../field-metrics";
import type { Subsample } from "@/types/subsample";

function valueText(value: number | undefined, unit: string, signed = false) {
  if (value === undefined) return "—";
  const rounded = Number(value.toFixed(2));
  return `${signed && rounded > 0 ? "+" : ""}${rounded.toFixed(2)}${unit === "%" ? "%" : ` ${unit}`}`;
}

export function FieldProgressPanel({ subsample: original }: { subsample: Subsample }) {
  const { scenario } = usePrototypeState();
  if (scenario === "empty") return <ScenarioEmpty title="No field progress yet" message="Metrics will appear when fieldwork starts." />;
  const subsample = { ...original };
  if (["metrics-complete", "metrics-zero", "quotas-combined"].includes(scenario)) Object.assign(subsample, {
    visitors: scenario === "metrics-zero" ? 0 : 1000,
    achievedCompletes: scenario === "metrics-zero" ? 0 : 120,
    incidence: 40, loi: 9, abandonRate: 10,
    expectedMetrics: { incidence: 45, loi: 8, conversion: 12, abandonRate: 17 },
  });
  if (scenario === "metrics-missing") { subsample.expectedMetrics = undefined; subsample.abandonRate = undefined; }
  if (scenario === "quotas-combined") subsample.quotaTables = [
    { id: "age", name: "Age", variables: ["agerange"], rows: [
      { quotaGroup: "18–24", achieved: 20, exclusiveRemaining: 10, sharedRemaining: 5 },
      { quotaGroup: "25–34", achieved: 30, exclusiveRemaining: 5, sharedRemaining: 10 },
    ] },
    { id: "gender", name: "Gender", variables: ["resp_gender"], rows: [
      { quotaGroup: "Female", achieved: 60, exclusiveRemaining: 10, sharedRemaining: 5 },
      { quotaGroup: "Male", achieved: 60, exclusiveRemaining: 10, sharedRemaining: 5 },
    ] },
    { id: "age-gender", name: "Age × Gender", variables: ["agerange", "resp_gender"], rows: [
      { quotaGroup: "18–24 × Female", achieved: 10, exclusiveRemaining: 5, sharedRemaining: 0 },
      { quotaGroup: "18–24 × Male", achieved: 10, exclusiveRemaining: 5, sharedRemaining: 5 },
      { quotaGroup: "25–34 × Female", achieved: 15, exclusiveRemaining: 0, sharedRemaining: 5 },
      { quotaGroup: "25–34 × Male", achieved: 15, exclusiveRemaining: 5, sharedRemaining: 5 },
    ] },
  ];
  if (scenario === "healthy") Object.assign(subsample, { visitors: 1250, achievedCompletes: 50, incidence: 40, loi: 4.2, exclusiveRemaining: 10, sharedRemaining: 40 });
  if (scenario === "low") Object.assign(subsample, { visitors: 2000, achievedCompletes: 10, incidence: 0.5, exclusiveRemaining: 40, sharedRemaining: 50, quotaTables: [], quotaBreakdown: [] });
  if (scenario === "nearly") Object.assign(subsample, { visitors: 1500, achievedCompletes: 98, incidence: 35, exclusiveRemaining: 0, sharedRemaining: 2, quotaTables: [{ id: "overall", name: "Overall target", variables: [], rows: [{ quotaGroup: "Overall target", achieved: 98, exclusiveRemaining: 0, sharedRemaining: 2 }] }] });
  if (scenario === "no-quota") { subsample.quotaTables = []; subsample.quotaBreakdown = []; }
  const tables = subsample.quotaTables ?? (subsample.quotaBreakdown?.length ? [{ id: "legacy", name: "Quota breakdown", variables: [], rows: subsample.quotaBreakdown }] : []);
  return <div className="space-y-8">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section aria-labelledby="field-progress-heading">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground" id="field-progress-heading">Field Progress</h2>
        <dl className="mt-5">{[["Visitors", subsample.visitors], ["Achieved Completes", subsample.achievedCompletes], ["Exclusive Remaining", subsample.exclusiveRemaining], ["Shared Remaining", subsample.sharedRemaining]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b px-2 py-3 last:border-b-0"><dt className="text-sm font-medium">{label}</dt><dd className="text-sm tabular-nums text-muted-foreground">{value}</dd></div>)}</dl>
      </section>
      <section aria-labelledby="field-metrics-heading" className="min-w-0 border-t pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground" id="field-metrics-heading">Field Metrics</h2>
        <div className="mt-5"><Table>
          <caption className="sr-only">Actual and expected field metrics. Difference is actual minus expected; pp means percentage points.</caption>
          <TableHeader><TableRow><TableHead scope="col">Metric</TableHead><TableHead scope="col" className="text-right">In field</TableHead><TableHead scope="col" className="text-right">Expected</TableHead><TableHead scope="col" className="text-right">Difference</TableHead></TableRow></TableHeader>
          <TableBody>{fieldMetricRows(subsample).map(metric => <TableRow key={metric.label}><TableCell className="font-medium">{metric.label}</TableCell><TableCell className="text-right tabular-nums">{valueText(metric.actual, metric.unit)}</TableCell><TableCell className="text-right tabular-nums">{valueText(metric.expected, metric.unit)}</TableCell><TableCell className="text-right tabular-nums">{valueText(metricDifference(metric.actual, metric.expected), metric.differenceUnit, true)}</TableCell></TableRow>)}</TableBody>
        </Table></div>
        <p className="mt-2 text-xs text-muted-foreground">Difference = in field − expected. pp = percentage points.</p>
      </section>
    </div>
    <section aria-labelledby="quota-breakdown-heading" className="space-y-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground" id="quota-breakdown-heading">Quota Breakdown</h2>
      {!tables.length ? <p className="rounded-md border px-4 py-6 text-sm text-muted-foreground">No quota breakdown is available for this subsample.</p> : tables.map((table, tableIndex) => <section key={table.id} aria-label={table.name} className={tableIndex ? "space-y-3 border-t pt-5" : "space-y-3"}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">{table.name}</h3>
          {table.variables.map(variable => <span key={variable} className="inline-flex items-center rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">{variable}</span>)}
        </div>
        <Table className="min-w-160 table-fixed"><colgroup><col /><col className="w-28" /><col className="w-44" /><col className="w-44" /></colgroup><caption className="sr-only">{table.name}: achievement and remaining counts</caption><TableHeader><TableRow><TableHead scope="col">Quota</TableHead><TableHead scope="col" className="text-right">Achieved</TableHead><TableHead scope="col" className="text-right">Exclusive Remaining</TableHead><TableHead scope="col" className="text-right">Shared Remaining</TableHead></TableRow></TableHeader><TableBody>{table.rows.map((row, index) => <TableRow key={`${row.quotaGroup}-${index}`}><TableCell className="font-medium">{row.quotaGroup}</TableCell><TableCell className="text-right tabular-nums">{row.achieved}</TableCell><TableCell className="text-right tabular-nums">{row.exclusiveRemaining}</TableCell><TableCell className="text-right tabular-nums">{row.sharedRemaining}</TableCell></TableRow>)}</TableBody></Table>
      </section>)}
    </section>
  </div>;
}
