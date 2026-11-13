import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyRedirects, emptyEndpoints, optionalIntegrationUrl, redirectValuesSchema,
  linkConfigurationRequestSchema,
} from "../src/features/settings/integration-model";
import { defaultSettings, settingsSchema } from "../src/features/settings/settings-model";
import { getRepositories } from "../src/lib/repositories";
import { refreshSubsampleFixtures } from "../src/lib/repositories/mock/refresh-subsample-fixtures";
import type { SupplierId, UserId } from "../src/types/ids";

const supplier = "supplier-northstar" as SupplierId;
const member = "user-ops-001" as UserId;
const admin = "user-admin-001" as UserId;

test("redirect and S2S URL validation allows templates and blank values consistently", () => {
  const settings = defaultSettings("Example");
  for (const url of ["", "https://supplier.example/return?uid=<<UID>>&status=<<status>>", "http://supplier.example/%%SURVEYID%%?pid=<<PID>>", "https://supplier.example/?name=hello%20world", `https://example.test/${"a".repeat(2027)}`]) {
    assert.equal(optionalIntegrationUrl.safeParse(url).success, true, url);
    assert.equal(settingsSchema.safeParse({ ...settings, redirects: { ...settings.redirects, completes: url } }).success, true);
    assert.equal(linkConfigurationRequestSchema.safeParse({ section: "server-to-server", setting: { mode: "override", value: { ...emptyEndpoints(), method: "POST", pixel: "", complete: url } } }).success, true);
  }
  for (const url of ["javascript:alert(1)", "ftp://example.test/path", "https://", "not-a-url", "https://example.test/has a space", "https://<<host>>/", "https://example.test/?pid=<<PID>", `https://example.test/${"a".repeat(2048)}`]) {
    assert.equal(optionalIntegrationUrl.safeParse(url).success, false, url);
    assert.equal(redirectValuesSchema.safeParse({ ...emptyRedirects(), completes: url }).success, false);
  }
  assert.ok("optOut" in settings.redirects);
});

test("link requests are strict and restrict methods without interpreting Pixel HTML", () => {
  for (const method of ["GET", "POST", "PUT", "PATCH"]) {
    const result = linkConfigurationRequestSchema.parse({ section: "server-to-server", setting: { mode: "override", value: { ...emptyEndpoints(), method, pixel: '<img src="https://example.test/pixel">' } } });
    assert.equal(result.setting.mode, "override");
  }
  for (const input of [
    { section: "security", setting: { mode: "inherit" } },
    { section: "redirects", setting: { mode: "inherit", value: emptyRedirects() } },
    { section: "server-to-server", setting: { mode: "override", value: { ...emptyEndpoints(), method: "DELETE", pixel: "" } } },
    { section: "redirects", setting: { mode: "override", value: { ...emptyRedirects(), sourceKey: "not-editable-here" } } },
  ]) assert.equal(linkConfigurationRequestSchema.safeParse(input).success, false);
});

test("section saves persist independent blanks, enforce supplier/project/actor scope and retain other sections", async () => {
  const repo = getRepositories();
  const subsample = (await repo.subsamples.listForSupplier(supplier))[0];
  const original = structuredClone(subsample.settingsOverrides);
  const originalDefaults = await repo.settings.get(supplier);
  try {
    const defaults = structuredClone(originalDefaults);
    defaults.redirects.completes = "https://supplier.example/default";
    await repo.settings.save(supplier, admin, "redirects", defaults);
    const custom = { ...emptyRedirects(), completes: "https://supplier.example/custom?uid=<<UID>>", optOut: "https://supplier.example/optout" };
    const saved = await repo.subsamples.saveLinkConfiguration(supplier, subsample.projectId, subsample.id, { section: "redirects", setting: { mode: "override", value: custom } }, member);
    assert.deepEqual(saved.settingsOverrides?.contacts, original?.contacts);
    assert.deepEqual(saved.settingsOverrides?.redirects, { mode: "override", value: custom });
    const s2s = { ...emptyEndpoints(), method: "PATCH" as const, pixel: "<pixel>" };
    await repo.subsamples.saveLinkConfiguration(supplier, subsample.projectId, subsample.id, { section: "server-to-server", setting: { mode: "override", value: s2s } }, admin);
    const read = await repo.subsamples.getById(supplier, subsample.id);
    assert.deepEqual(read?.settingsOverrides?.redirects, { mode: "override", value: custom });
    assert.deepEqual(read?.settingsOverrides?.serverToServer, { mode: "override", value: s2s });
    defaults.redirects.completes = "https://supplier.example/new-default";
    await repo.settings.save(supplier, admin, "redirects", defaults);
    assert.deepEqual((await repo.subsamples.getById(supplier, subsample.id))?.settingsOverrides?.redirects, { mode: "override", value: custom });
    read!.settingsOverrides!.serverToServer = { mode: "inherit" };
    assert.deepEqual((await repo.subsamples.getById(supplier, subsample.id))?.settingsOverrides?.serverToServer, { mode: "override", value: s2s });
    for (const [owner, project, actor] of [["foreign", subsample.projectId, member], [supplier, "wrong-project", member], [supplier, subsample.projectId, "unknown-user"]]) {
      await assert.rejects(repo.subsamples.saveLinkConfiguration(owner as SupplierId, project as typeof subsample.projectId, subsample.id, { section: "redirects", setting: { mode: "inherit" } }, actor as UserId), /FORBIDDEN|NOT_FOUND/);
    }
    await repo.subsamples.saveLinkConfiguration(supplier, subsample.projectId, subsample.id, { section: "redirects", setting: { mode: "override", value: emptyRedirects() } }, member);
    const blank = (await repo.subsamples.getById(supplier, subsample.id))!.settingsOverrides!.redirects;
    assert.deepEqual(blank, { mode: "override", value: emptyRedirects() });
    await repo.subsamples.saveLinkConfiguration(supplier, subsample.projectId, subsample.id, { section: "redirects", setting: { mode: "inherit" } }, member);
    assert.deepEqual((await repo.subsamples.getById(supplier, subsample.id))?.settingsOverrides?.redirects, { mode: "inherit" });
    assert.equal((await repo.settings.get(supplier)).redirects.completes, defaults.redirects.completes);
  } finally {
    await repo.settings.save(supplier, admin, "redirects", originalDefaults);
    await repo.subsamples.saveLinkConfiguration(supplier, subsample.projectId, subsample.id, { section: "redirects", setting: original?.redirects ?? { mode: "inherit" } }, admin);
    await repo.subsamples.saveLinkConfiguration(supplier, subsample.projectId, subsample.id, { section: "server-to-server", setting: original?.serverToServer ?? { mode: "inherit" } }, admin);
  }
});

test("development fixture refresh preserves saved link configurations", async () => {
  const fixture = (await getRepositories().subsamples.listForSupplier(supplier))[0];
  const current = structuredClone(fixture);
  current.settingsOverrides = { ...current.settingsOverrides, redirects: { mode: "override", value: { ...emptyRedirects(), optOut: "https://example.test/optout" } }, serverToServer: { mode: "override", value: { ...emptyEndpoints(), method: "GET", pixel: "" } } };
  const before = structuredClone(current.settingsOverrides);
  refreshSubsampleFixtures([current], [fixture]);
  assert.deepEqual(current.settingsOverrides, before);
});
