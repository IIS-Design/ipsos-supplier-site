import type { Cost } from "@/types/cost";

export type CostBreakdown = {
  currency: string;
  completes: number;
  sample: number;
  averageCpi: number | null;
  minimumFee: number | null;
  otherFees: number | null;
  discount: number | null;
  total: number;
};
const cents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Sample uses final subsample amounts; project adjustments are applied once. Demo pricing follows Sample + Min Fee + Other Fees - Discount. Average CPI excludes adjustments. */
export function getCostBreakdown(records: readonly Cost[]): CostBreakdown[] {
  const groups = new Map<string, CostBreakdown>();
  for (const cost of records) {
    const group = groups.get(cost.currency) ?? { currency: cost.currency, completes: 0, sample: 0, averageCpi: null, minimumFee: null, otherFees: null, discount: null, total: 0 };
    const project = cost.scope.scopeType === "project";
    const sample = project ? cost.sampleCost ?? cost.completes * cost.cpi : cost.totalCost;
    group.sample += sample;
    group.completes += cost.completes;
    if (project && cost.minimumFee != null) group.minimumFee = (group.minimumFee ?? 0) + cost.minimumFee;
    if (project && cost.otherFees != null) group.otherFees = (group.otherFees ?? 0) + cost.otherFees;
    if (project && cost.discountAmount != null) group.discount = (group.discount ?? 0) + cost.discountAmount;
    groups.set(cost.currency, group);
  }
  return [...groups.values()].map(group => ({ ...group,
    sample: cents(group.sample),
    averageCpi: group.completes > 0 ? group.sample / group.completes : null,
    total: cents(group.sample + (group.minimumFee ?? 0) + (group.otherFees ?? 0) - (group.discount ?? 0)),
  }));
}
