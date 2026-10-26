import assert from "node:assert/strict";
import test from "node:test";
import { accountSchema } from "../src/features/account/account-model";
import { getRepositories } from "../src/lib/repositories";
import { mockRecoveryStore } from "../src/lib/auth/mock-recovery-store";
import type { SupplierId, UserId } from "../src/types/ids";

const supplier = "supplier-northstar" as SupplierId;
const id = "user-ops-001" as UserId;

test("account validates names/email and rejects protected identity/role fields", () => {
  assert.deepEqual(accountSchema.parse({ firstName: " Sarah ", lastName: " Billingson ", email: " USER@SUPPLIER.COM " }), { firstName: "Sarah", lastName: "Billingson", email: "user@supplier.com" });
  for (const extra of [{ role: "admin" }, { supplierId: "other" }, { id: "other" }]) assert.equal(accountSchema.safeParse({ firstName: "Sarah", lastName: "Billingson", email: "user@supplier.com", ...extra }).success, false);
  assert.equal(accountSchema.safeParse({ firstName: " ", lastName: "Name", email: "invalid" }).success, false);
});

test("profile save is supplier-scoped, unique, clone-safe and preserves identity/credentials", async () => {
  const repository = getRepositories().users;
  const original = (await repository.getById(supplier, id))!;
  const profile = { firstName: original.firstName, lastName: original.lastName, email: original.email };
  await assert.rejects(repository.saveProfile("other-supplier" as SupplierId, id, profile), /ACCOUNT_NOT_FOUND/);
  await assert.rejects(repository.saveProfile(supplier, id, { ...profile, email: "ADMIN@SUPPLIER.COM" }), /EMAIL_IN_USE/);
  assert.deepEqual(await repository.getById(supplier, id), original);
  const receipt = mockRecoveryStore.request(original.email, true);
  const firstMail = mockRecoveryStore.inbox(receipt)!;
  mockRecoveryStore.reset(firstMail.token, "account-test-password");
  const oldReceipt = mockRecoveryStore.request(original.email, true);
  const oldToken = mockRecoveryStore.inbox(oldReceipt)!.token;
  const updated = await repository.saveProfile(supplier, id, { ...profile, firstName: "Updated", email: "updated-user@supplier.com" });
  assert.equal(updated.role, original.role);
  assert.equal(updated.id, original.id);
  assert.equal(updated.supplierId, original.supplierId);
  assert.equal(await repository.getByEmail(original.email), null);
  assert.equal((await repository.getByEmail(updated.email))?.id, original.id);
  assert.equal(mockRecoveryStore.acceptsPassword(updated.email, "account-test-password"), true);
  assert.equal(mockRecoveryStore.acceptsPassword(updated.email, "wrong-password"), false);
  assert.equal(mockRecoveryStore.status(oldToken), "invalid");
  assert.equal(mockRecoveryStore.inbox(oldReceipt), null);
  updated.firstName = "External mutation";
  assert.equal((await repository.getById(supplier, id))?.firstName, "Updated");
  await repository.saveProfile(supplier, id, profile);
});
