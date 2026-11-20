import type { Cost } from "@/types/cost";

export const costScenarios = [
  ["costs-many", "Many CPI entries", "Shows 200 synthetic CPI entries to inspect dense expanded events. Approval is disabled in this preview."],
  ["costs-with-adjustments", "With fees and discounts", "Shows example values for project fees and discounts without saving changes."],
  ["costs-without-adjustments", "Without fees and discounts", "Shows optional project adjustments as N/A without changing costs."],
] as const;

/** Presentation-only previews. Source records and approval state stay unchanged. */
export function previewCostAdjustments(costs: Cost[], scenario: string): Cost[] {
  if (scenario === "costs-many") {
    const samples = costs.filter(cost => cost.scope.scopeType === "subsample");
    if (!samples.length) return costs;
    return Array.from({ length: 200 }, (_, index) => ({ ...samples[index % samples.length], id: `cost-preview-${index + 1}` as Cost["id"], status: "pending_approval" as const, approval: undefined }));
  }
  if (!costScenarios.some(([id]) => id === scenario)) return costs;
  return costs.map(cost => {
    if (cost.scope.scopeType !== "project") return cost;
    const next = {
      ...cost,
      minimumFee: scenario === "costs-with-adjustments" ? cost.minimumFee ?? 100 : undefined,
      otherFees: scenario === "costs-with-adjustments" ? cost.otherFees ?? 15 : undefined,
      otherFeesReason: scenario === "costs-with-adjustments" ? cost.otherFeesReason || "Additional project management" : undefined,
      discountAmount: scenario === "costs-with-adjustments" ? cost.discountAmount || 10 : undefined,
      discountReason: scenario === "costs-with-adjustments" ? cost.discountReason || "Agreed commercial discount" : undefined,
    };
    return { ...next, totalCost: Math.round(((cost.sampleCost ?? cost.completes * cost.cpi) + (next.minimumFee ?? 0) + (next.otherFees ?? 0) - (next.discountAmount ?? 0)) * 100) / 100 };
  });
}
