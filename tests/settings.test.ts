import assert from "node:assert/strict";
import test from "node:test";
import { getRepositories } from "../src/lib/repositories";
import { defaultSettings, settingsSchema, userManagementSchema } from "../src/features/settings/settings-model";
import type { SupplierId, UserId } from "../src/types/ids";
const supplier = "supplier-northstar" as SupplierId;
const admin = "user-admin-001" as UserId;
const actor = "user-ops-001" as UserId;

test("settings rejects unsafe URLs, invalid routing limits, unknown fields and roles", () => {
  const values = defaultSettings("Example");
  assert.equal(settingsSchema.safeParse(values).success, true);
  for (const url of ["javascript:alert(1)", "file:///tmp/test", "not-a-url"]) {
    assert.equal(settingsSchema.safeParse({ ...values, redirects: { ...values.redirects, completes: url } }).success, false);
  }
  assert.equal(settingsSchema.safeParse({ ...values, "server-to-server": { ...values["server-to-server"], attempts: 0 } }).success, false);
  assert.equal(userManagementSchema.safeParse({ action: "invite", profile: { firstName: "A", lastName: "B", email: "a@example.com", role: "finance" } }).success, false);
  assert.equal(userManagementSchema.safeParse({ action: "deactivate", userId: admin, supplierId: "foreign" }).success, false);
});

test("settings saves only the requested supplier section, enforces admin ownership and clones state", async () => {
  const repo = getRepositories();
  const original = await repo.settings.get(supplier);
  const next = structuredClone(original);
  next.redirects.completes = "https://example.com/complete";
  next.organization.companyName = "Should not overwrite organization";
  await assert.rejects(repo.settings.save(supplier, actor, "redirects", next), /FORBIDDEN/);
  await assert.rejects(repo.settings.save("foreign" as SupplierId, admin, "redirects", next), /FORBIDDEN/);
  const saved = await repo.settings.save(supplier, admin, "redirects", next);
  assert.equal(saved.organization.companyName, original.organization.companyName);
  assert.equal(saved.redirects.completes, next.redirects.completes);
  saved.redirects.completes = "tampered";
  assert.equal((await repo.settings.get(supplier)).redirects.completes, next.redirects.completes);
  await repo.settings.save(supplier, admin, "redirects", original);
});

test("managed users are supplier scoped, reject duplicate identities and prevent administrator lockout", async () => {
  const repo = getRepositories().users;
  const profile = { firstName: "Invited", lastName: "Tester", email: "settings-invite@example.com", role: "user" as const };
  await assert.rejects(repo.manage(supplier, actor, { action: "invite", profile }), /FORBIDDEN/);
  await assert.rejects(repo.manage("foreign" as SupplierId, admin, { action: "invite", profile }), /FORBIDDEN/);
  const invited = await repo.manage(supplier, admin, { action: "invite", profile });
  assert.equal(invited.status, "invited");
  await assert.rejects(repo.manage(supplier, admin, { action: "invite", profile }), /EMAIL_IN_USE/);
  await assert.rejects(repo.manage(supplier, admin, { action: "reset-password", userId: invited.id }), /USER_NOT_ACTIVE/);
  await assert.rejects(repo.manage(supplier, admin, { action: "deactivate", userId: admin }), /SELF_CHANGE/);
  await assert.rejects(repo.manage(supplier, admin, { action: "edit", userId: admin, profile: { ...profile, email: "admin@supplier.com" } }), /SELF_CHANGE/);
  await assert.rejects(repo.manage(supplier, admin, { action: "deactivate", userId: "foreign-user" }), /NOT_FOUND/);
  const deactivated = await repo.manage(supplier, admin, { action: "deactivate", userId: actor });
  assert.equal(deactivated.status, "inactive");
  await assert.rejects(repo.manage(supplier, admin, { action: "reset-password", userId: actor }), /USER_NOT_ACTIVE/);
  await repo.manage(supplier, admin, { action: "activate", userId: actor });
});
