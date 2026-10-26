import assert from "node:assert/strict";
import { test } from "node:test";
import { mockRepositories as repositories } from "../src/lib/repositories/mock/mock-repositories";
import {
  contactsSchema,
  contactSelections,
  emptyContacts,
  resolveContacts,
} from "../src/features/contacts/contact-model";
import type {
  ProjectId,
  SubsampleId,
  SupplierId,
  UserId,
} from "../src/types/ids";

const supplierId = "supplier-northstar" as SupplierId;
const adminId = "user-admin-001" as UserId;
const userId = "user-ops-001" as UserId;
const projectId = "project-1046192" as ProjectId;
const subsampleId = "subsample-1014592" as SubsampleId;

test("contact defaults → custom override → changed defaults → inherit", async (t) => {
  const supplier = (await repositories.suppliers.getById(supplierId))!;
  const original = structuredClone(supplier.settings.contacts!);
  const originalSubsample = (await repositories.subsamples.getById(
    supplierId,
    subsampleId,
  ))!;

  await t.test(
    "only administrators may save organization defaults",
    async () => {
      await assert.rejects(
        repositories.suppliers.saveContactDefaults(
          supplierId,
          original,
          userId,
        ),
        /permission/,
      );
      await assert.rejects(
        repositories.suppliers.saveContactDefaults(
          "another-supplier" as SupplierId,
          original,
          adminId,
        ),
        /permission/,
      );
    },
  );

  await t.test(
    "partial/malformed defaults and duplicate emails are rejected",
    async () => {
      assert.equal(
        contactsSchema.safeParse({ projectManager: [] }).success,
        false,
      );
      const invalid = structuredClone(original);
      invalid.projectManager[0].email = "invalid";
      await assert.rejects(
        repositories.suppliers.saveContactDefaults(
          supplierId,
          invalid,
          adminId,
        ),
      );
      const duplicate = structuredClone(original);
      duplicate.projectManager.push({
        ...duplicate.projectManager[0],
        id: "duplicate",
      });
      assert.equal(contactsSchema.safeParse(duplicate).success, false);
      assert.deepEqual(
        (await repositories.suppliers.getById(supplierId))?.settings.contacts,
        original,
      );
    },
  );

  await t.test("supplier members can save own Subsample contacts", async () => {
    const updated = await repositories.subsamples.saveContacts(
      supplierId,
      projectId,
      subsampleId,
      {
        mode: "override",
        value: { ...contactSelections(), helpDesk: [original.helpDesk[0].id] },
      },
      userId,
    );
    assert.equal(updated.settingsOverrides?.contacts?.mode, "override");
    assert.deepEqual(
      updated.settingsOverrides?.redirects,
      originalSubsample.settingsOverrides?.redirects,
    );
  });

  await t.test(
    "default changes propagate only to inherited values",
    async () => {
      const changed = structuredClone(original);
      changed.helpDesk[0].name = "Updated Default Help Desk";
      const saved = await repositories.suppliers.saveContactDefaults(
        supplierId,
        changed,
        adminId,
      );
      assert.notEqual(saved.helpDesk[0].id, original.helpDesk[0].id);
      const options =
        await repositories.suppliers.listContactOptions(supplierId);
      const subsample = (await repositories.subsamples.getById(
        supplierId,
        subsampleId,
      ))!;
      assert.equal(
        resolveContacts(saved, options, { mode: "inherit" }).helpDesk[0].name,
        "Updated Default Help Desk",
      );
      assert.deepEqual(
        resolveContacts(saved, options, subsample.settingsOverrides?.contacts)
          .helpDesk,
        original.helpDesk,
      );
      assert.deepEqual(
        resolveContacts(saved, options, subsample.settingsOverrides?.contacts)
          .projectManager,
        [],
      );
    },
  );

  await t.test(
    "removing defaults does not orphan existing custom selections",
    async () => {
      const saved = await repositories.suppliers.saveContactDefaults(
        supplierId,
        emptyContacts(),
        adminId,
      );
      const options =
        await repositories.suppliers.listContactOptions(supplierId);
      const subsample = (await repositories.subsamples.getById(
        supplierId,
        subsampleId,
      ))!;
      assert.deepEqual(
        resolveContacts(saved, options, subsample.settingsOverrides?.contacts)
          .helpDesk,
        original.helpDesk,
      );
      assert.deepEqual(resolveContacts(saved, options), emptyContacts());
    },
  );

  await t.test("unknown/wrong-role IDs are rejected atomically", async () => {
    const before = await repositories.subsamples.getById(
      supplierId,
      subsampleId,
    );
    await assert.rejects(
      repositories.subsamples.saveContacts(
        supplierId,
        projectId,
        subsampleId,
        {
          mode: "override",
          value: {
            ...contactSelections(),
            projectManager: [original.helpDesk[0].id],
          },
        },
        adminId,
      ),
      /unavailable/,
    );
    assert.deepEqual(
      await repositories.subsamples.getById(supplierId, subsampleId),
      before,
    );
  });

  await t.test(
    "cross-supplier actors and wrong Project/Subsample paths are rejected",
    async () => {
      await assert.rejects(
        repositories.subsamples.saveContacts(
          "another-supplier" as SupplierId,
          projectId,
          subsampleId,
          { mode: "inherit" },
          adminId,
        ),
        /permission/,
      );
      await assert.rejects(
        repositories.subsamples.saveContacts(
          supplierId,
          "wrong-project" as ProjectId,
          subsampleId,
          { mode: "inherit" },
          adminId,
        ),
        /not found/,
      );
    },
  );

  await t.test(
    "explicitly empty custom selections do not inherit",
    async () => {
      await repositories.suppliers.saveContactDefaults(
        supplierId,
        original,
        adminId,
      );
      const updated = await repositories.subsamples.saveContacts(
        supplierId,
        projectId,
        subsampleId,
        { mode: "override", value: contactSelections() },
        userId,
      );
      assert.deepEqual(
        resolveContacts(
          original,
          await repositories.suppliers.listContactOptions(supplierId),
          updated.settingsOverrides?.contacts,
        ),
        emptyContacts(),
      );
    },
  );

  await t.test(
    "saving inheritance removes custom values and survives subsequent reads",
    async () => {
      await repositories.subsamples.saveContacts(
        supplierId,
        projectId,
        subsampleId,
        { mode: "inherit" },
        userId,
      );
      const loaded = (await repositories.subsamples.getById(
        supplierId,
        subsampleId,
      ))!;
      assert.deepEqual(loaded.settingsOverrides?.contacts, { mode: "inherit" });
      assert.deepEqual(
        resolveContacts(
          original,
          await repositories.suppliers.listContactOptions(supplierId),
          loaded.settingsOverrides?.contacts,
        ),
        original,
      );
    },
  );

  await t.test(
    "repository callers cannot mutate saved state through returned values",
    async () => {
      const copy = (await repositories.suppliers.getById(supplierId))!;
      copy.settings.contacts!.helpDesk.length = 0;
      assert.equal(
        (await repositories.suppliers.getById(supplierId))!.settings.contacts!
          .helpDesk.length,
        1,
      );
    },
  );
});
