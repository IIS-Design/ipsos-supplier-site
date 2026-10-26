import { getRepositories } from "@/lib/repositories";
import type { CostId, SupplierId, UserId } from "@/types/ids";

export const getCosts = (supplierId: SupplierId) =>
  getRepositories().costs.listForSupplier(supplierId);

export const getCost = (supplierId: SupplierId, costId: CostId) =>
  getRepositories().costs.getById(supplierId, costId);

export const decideCosts = (
  supplierId: SupplierId,
  costIds: CostId[],
  decision: "approved" | "rejected",
  actorId: UserId,
  note?: string,
) =>
  getRepositories().costs.decideMany(
    supplierId,
    costIds,
    decision,
    actorId,
    note,
  );
