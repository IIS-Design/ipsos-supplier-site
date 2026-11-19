import assert from "node:assert/strict";
import test from "node:test";
import { mockRepositories, restoreMockPendingCosts } from "../src/lib/repositories/mock/mock-repositories";
import type { SupplierId, UserId } from "../src/types/ids";

test("approved demo costs become available again while original history is retained", async () => {
  const supplierId = "supplier-northstar" as SupplierId;
  const original = await mockRepositories.costs.listForSupplier(supplierId);
  const pending = original.filter(cost => cost.status === "pending_approval");
  const history = structuredClone(original.filter(cost => cost.status !== "pending_approval"));
  assert.ok(pending.length > 0);
  await mockRepositories.costs.decideMany(supplierId, pending.map(cost => cost.id), "approved", "user-admin-001" as UserId);
  assert.equal((await mockRepositories.costs.listForSupplier(supplierId)).filter(cost => cost.status === "pending_approval").length, 0);
  assert.equal(restoreMockPendingCosts(supplierId), pending.length);
  const restored = await mockRepositories.costs.listForSupplier(supplierId);
  assert.deepEqual(JSON.parse(JSON.stringify(restored.filter(cost => cost.status === "pending_approval"))), JSON.parse(JSON.stringify(pending)));
  assert.deepEqual(restored.filter(cost => cost.status !== "pending_approval"), history);
});
