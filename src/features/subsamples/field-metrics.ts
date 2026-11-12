import type { Subsample } from "@/types/subsample";

/** Prototype assumption: Visitors is equivalent to Clicks; confirm with legacy integration. */
export function conversionRate(completes: number, visitors: number): number | undefined {
  return visitors > 0 ? completes / visitors * 100 : undefined;
}
export function metricDifference(actual: number | undefined, expected: number | undefined) {
  return actual === undefined || expected === undefined ? undefined : actual - expected;
}
export function fieldMetricRows(subsample: Subsample) {
  const expected = subsample.expectedMetrics;
  return [
    { label: "LOI", actual: subsample.loi, expected: expected?.loi, unit: "min", differenceUnit: "min" },
    { label: "Incidence", actual: subsample.incidence, expected: expected?.incidence, unit: "%", differenceUnit: "pp" },
    { label: "Conversion", actual: conversionRate(subsample.achievedCompletes, subsample.visitors), expected: expected?.conversion, unit: "%", differenceUnit: "pp" },
    { label: "Total Abandon", actual: subsample.abandonRate, expected: expected?.abandonRate, unit: "%", differenceUnit: "pp" },
  ];
}
