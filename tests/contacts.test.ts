import assert from "node:assert/strict";
import { test } from "node:test";
import { mockRepositories as repositories } from "../src/lib/repositories/mock/mock-repositories";
import { contactsSchema, contactSelections, migrateContacts, emptyContacts, resolveContacts } from "../src/features/contacts/contact-model";
import type { ProjectId, SubsampleId, SupplierId, UserId } from "../src/types/ids";
const supplierId = "supplier-northstar" as SupplierId;
const adminId = "user-admin-001" as UserId;
const userId = "user-ops-001" as UserId;
const projectId = "project-1046192" as ProjectId;
const subsampleId = "subsample-1014592" as SubsampleId;

test("supplier defaults → custom override → changed defaults → inherit", async t => {
  const original = structuredClone((await repositories.suppliers.getById(supplierId))!.settings.contacts!);
  const originalSubsample = (await repositories.subsamples.getById(supplierId, subsampleId))!;
  await t.test("only same-supplier active administrators save defaults", async () => {
    await assert.rejects(repositories.suppliers.saveContactDefaults(supplierId, original, userId), /permission/);
    await assert.rejects(repositories.suppliers.saveContactDefaults("another-supplier" as SupplierId, original, adminId), /permission/);
  });
  await t.test("invalid emails, duplicate normalized addresses and legacy writes are rejected atomically", async () => {
    assert.equal(contactsSchema.safeParse({ legacyGroup: [] }).success, false);
    await assert.rejects(repositories.suppliers.saveContactDefaults(supplierId, [{ ...original[0], email: "invalid" }], adminId));
    assert.equal(contactsSchema.safeParse([original[0], { ...original[0], id: "duplicate", email: original[0].email.toUpperCase() }]).success, false);
    assert.deepEqual((await repositories.suppliers.getById(supplierId))?.settings.contacts, original);
  });
  await t.test("legacy migration retains contact identities and explicit selections", () => {
    assert.deepEqual(migrateContacts({ groupOne: [original[0]], groupTwo: [original[1]] }), original.slice(0, 2));
    assert.deepEqual(contactSelections({ groupOne: [original[0].id], groupTwo: [original[1].id] }), original.slice(0, 2).map(contact => contact.id));
  });
  await t.test("supplier members save independent subsample selections", async () => {
    const saved = await repositories.subsamples.saveContacts(supplierId, projectId, subsampleId, { mode: "override", value: [original[0].id] }, userId);
    assert.deepEqual(saved.settingsOverrides?.redirects, originalSubsample.settingsOverrides?.redirects);
  });
  await t.test("changed defaults inherit while custom snapshots remain independent", async () => {
    const changed = structuredClone(original); changed[0].name = "Updated Contact";
    const saved = await repositories.suppliers.saveContactDefaults(supplierId, changed, adminId);
    assert.notEqual(saved[0].id, original[0].id);
    const options = await repositories.suppliers.listContactOptions(supplierId);
    assert.equal(resolveContacts(saved, options, { mode: "inherit" })[0].name, "Updated Contact");
    assert.deepEqual(resolveContacts(saved, options, { mode: "override", value: [original[0].id] }), [original[0]]);
  });
  await t.test("removing defaults preserves historical custom contacts", async () => {
    const saved = await repositories.suppliers.saveContactDefaults(supplierId, emptyContacts(), adminId);
    assert.deepEqual(resolveContacts(saved, await repositories.suppliers.listContactOptions(supplierId), { mode: "override", value: [original[0].id] }), [original[0]]);
    assert.deepEqual(resolveContacts(saved, []), []);
  });
  await t.test("unknown selections and wrong project/supplier paths are rejected", async () => {
    const before = await repositories.subsamples.getById(supplierId, subsampleId);
    await assert.rejects(repositories.subsamples.saveContacts(supplierId, projectId, subsampleId, { mode: "override", value: ["unknown"] }, adminId), /unavailable/);
    await assert.rejects(repositories.subsamples.saveContacts("another-supplier" as SupplierId, projectId, subsampleId, { mode: "inherit" }, adminId), /permission/);
    await assert.rejects(repositories.subsamples.saveContacts(supplierId, "wrong-project" as ProjectId, subsampleId, { mode: "inherit" }, adminId), /not found/);
    assert.deepEqual(await repositories.subsamples.getById(supplierId, subsampleId), before);
  });
  await t.test("portal users and standalone emails coexist; foreign user IDs are rejected", async () => {
    const user = (await repositories.users.getById(supplierId, adminId))!;
    const saved = await repositories.suppliers.saveContactDefaults(supplierId, [{ id: "draft-user", userId: user.id, name: "Untrusted name", email: user.email }, { id: "draft-email", name: "", email: " FINANCE@SUPPLIER.COM " }], adminId);
    assert.equal(saved[0].name, `${user.firstName} ${user.lastName}`);
    assert.equal(saved[0].userId, user.id);
    assert.equal(saved[1].email, "finance@supplier.com");
    await assert.rejects(repositories.suppliers.saveContactDefaults(supplierId, [{ id: "foreign", userId: "foreign-user", name: "", email: "foreign@example.com" }], adminId), /unavailable/);
    assert.deepEqual((await repositories.suppliers.getById(supplierId))?.settings.contacts, saved);
  });
  await t.test("explicitly empty overrides never inherit", async () => {
    await repositories.suppliers.saveContactDefaults(supplierId, original, adminId);
    const updated = await repositories.subsamples.saveContacts(supplierId, projectId, subsampleId, { mode: "override", value: [] }, userId);
    assert.deepEqual(resolveContacts(original, await repositories.suppliers.listContactOptions(supplierId), updated.settingsOverrides?.contacts), []);
  });
  await t.test("returning to inheritance persists and returned values cannot mutate the store", async () => {
    await repositories.subsamples.saveContacts(supplierId, projectId, subsampleId, { mode: "inherit" }, userId);
    assert.deepEqual((await repositories.subsamples.getById(supplierId, subsampleId))?.settingsOverrides?.contacts, { mode: "inherit" });
    const copy = (await repositories.suppliers.getById(supplierId))!; copy.settings.contacts!.length = 0;
    assert.equal((await repositories.suppliers.getById(supplierId))!.settings.contacts!.length, original.length);
  });
});
