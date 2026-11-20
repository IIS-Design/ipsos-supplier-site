import type { Cost } from "@/types/cost";

/** Refresh fixture-owned values after HMR without resetting mock approval decisions. */
export function refreshCostFixtures(current: Cost[], fixtures: Cost[]) {
  const byId = new Map(fixtures.map(cost => [`${cost.supplierId}:${cost.id}`, cost]));
  // Retire the obsolete zero-value demo adjustment cached before fixture cleanup.
  for (let index = current.length - 1; index >= 0; index--) {
    const cost = current[index];
    if (cost.id === "cost-003" && cost.supplierId === "supplier-northstar" && cost.totalCost === 0 && !byId.has(`${cost.supplierId}:${cost.id}`)) current.splice(index, 1);
  }
  for (let index = 0; index < current.length; index++) {
    const existing = current[index];
    const fixture = byId.get(`${existing.supplierId}:${existing.id}`);
    if (!fixture) continue;
    current[index] = {
      ...structuredClone(fixture),
      status: existing.status,
      supplierStatus: existing.supplierStatus,
      ipsosStatus: existing.ipsosStatus,
      approval: existing.approval,
    };
  }
  const known = new Set(current.map(cost => `${cost.supplierId}:${cost.id}`));
  current.push(...structuredClone(fixtures.filter(cost => !known.has(`${cost.supplierId}:${cost.id}`))));
}

/** Restore the supplier's original pending demo costs; keep original history and other suppliers. */
export function restorePendingCostFixtures(current: Cost[], fixtures: Cost[], supplierId: string) {
  const pending = fixtures.filter(cost => cost.supplierId === supplierId && cost.status === "pending_approval");
  for (const fixture of pending) {
    const index = current.findIndex(cost => cost.supplierId === supplierId && cost.id === fixture.id);
    if (index < 0) current.push(structuredClone(fixture));
    else current[index] = structuredClone(fixture);
  }
  return pending.length;
}
