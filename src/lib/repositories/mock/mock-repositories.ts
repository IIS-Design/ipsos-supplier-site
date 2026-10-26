import { defaultSettings, settingsSchema, userManagementSchema } from "@/features/settings/settings-model";
import type { SettingsValues } from "@/features/settings/settings-model";
import "server-only";
import { accountSchema } from "@/features/account/account-model";
import { mockRecoveryStore } from "@/lib/auth/mock-recovery-store";
import type { User } from "@/types/user";
import { randomUUID } from "node:crypto";
import {
  contactOverrideSchema,
  migrateContacts,
  contactSelections,
  contactsSchema,
  emptyContacts,
} from "@/features/contacts/contact-model";
import type { Supplier, SupplierContacts } from "@/types/supplier";
import type { Subsample } from "@/types/subsample";

import type {
  CostId,
  ProjectId,
  ReportId,
  SubsampleId,
  SupplierId,
  UserId,
} from "@/types/ids";
import type { Report } from "@/types/report";
import type { Cost } from "@/types/cost";
import type {
  CostRepository,
  PortalRepositories,
  ProjectRepository,
  ReportRepository,
  SubsampleRepository,
  SupplierRepository,
  UserRepository,
} from "../contracts";
import {
  costs,
  projects,
  reports,
  subsamples,
  suppliers,
  users,
} from "./fixture-store";

type MockReportGlobal = typeof globalThis & {
  __ipsosSupplierMockReports?: Report[];
};

const reportState = globalThis as MockReportGlobal;
const reportRecords = (reportState.__ipsosSupplierMockReports ??= [...reports]);

type MockCostGlobal = typeof globalThis & {
  __ipsosSupplierMockCosts?: Cost[];
};

const costState = globalThis as MockCostGlobal;
const costRecords = (costState.__ipsosSupplierMockCosts ??= [...costs]);

// Process-local mock persistence, matching Reports and Costs. Replace this adapter
// with durable storage for deployment. Contact identities are immutable: replacing
// a default retains old identities so saved Subsample overrides remain independent.
type ContactState = {
  suppliers: Supplier[];
  subsamples: Subsample[];
  options: Record<string, SupplierContacts>;
};
const contactGlobal = globalThis as typeof globalThis & {
  __ipsosSupplierContacts?: ContactState;
};
const contactState = (contactGlobal.__ipsosSupplierContacts ??= {
  suppliers: structuredClone(suppliers),
  subsamples: structuredClone(subsamples),
  options: Object.fromEntries(
    suppliers.map((supplier) => [
      supplier.id,
      structuredClone(supplier.settings.contacts ?? emptyContacts()),
    ]),
  ),
});

// Flatten older process-local groups while preserving IDs and explicit overrides.
for (const supplier of contactState.suppliers) supplier.settings.contacts = migrateContacts(supplier.settings.contacts);
for (const key of Object.keys(contactState.options)) contactState.options[key] = migrateContacts(contactState.options[key]);
for (const subsample of contactState.subsamples) {
  const setting = subsample.settingsOverrides?.contacts;
  if (setting?.mode === "override") setting.value = contactSelections(setting.value);
}

// HMR keeps process-local edits. Add newly seeded Subsamples without discarding
// saved contact choices when the fixture catalogue grows during development.
if (process.env.NODE_ENV === "development") {
  const knownIds = new Set(contactState.subsamples.map(({ id }) => id));
  contactState.subsamples.push(
    ...structuredClone(subsamples.filter(({ id }) => !knownIds.has(id))),
  );
}

function requireContactActor(
  supplierId: SupplierId,
  actorId: UserId,
  adminOnly = false,
) {
  const actor = userRecords.find(
    (user) => user.id === actorId && user.supplierId === supplierId && (user.status ?? "active") === "active",
  );
  if (!actor || (adminOnly && actor.role !== "admin"))
    throw new Error("You do not have permission to update these contacts.");
}

const supplierRepository: SupplierRepository = {
  async list() {
    return structuredClone(contactState.suppliers);
  },
  async getById(supplierId) {
    return structuredClone(
      contactState.suppliers.find((supplier) => supplier.id === supplierId) ??
        null,
    );
  },
  async listContactOptions(supplierId) {
    return structuredClone(contactState.options[supplierId] ?? emptyContacts());
  },
  async saveContactDefaults(supplierId, input, actorId) {
    requireContactActor(supplierId, actorId, true);
    const contacts = contactsSchema.parse(input);
    const supplier = contactState.suppliers.find(
      (item) => item.id === supplierId,
    );
    if (!supplier) throw new Error("Supplier not found.");
    const options = structuredClone(
      contactState.options[supplierId] ?? emptyContacts(),
    );
    const next = contacts.map(contact => {
      const linkedUser = contact.userId ? userRecords.find(user => user.id === contact.userId && user.supplierId === supplierId) : undefined;
      if (contact.userId && !linkedUser) throw new Error("The selected user is unavailable.");
      const canonical = linkedUser ? { ...contact, name: `${linkedUser.firstName} ${linkedUser.lastName}`, email: linkedUser.email } : contact;
      const existing = options.find(item => item.name === canonical.name && item.email.toLowerCase() === canonical.email.toLowerCase() && item.userId === canonical.userId);
      if (existing) return existing;
      const created = { ...canonical, id: `contact-${randomUUID()}` };
      options.push(created);
      return created;
    });
    contactsSchema.parse(next);
    supplier.settings = { ...supplier.settings, contacts: next };
    contactState.options[supplierId] = options;
    return structuredClone(next);
  },
};

const userGlobal = globalThis as typeof globalThis & { __ipsosAccountUsers?: User[] };
const userRecords = (userGlobal.__ipsosAccountUsers ??= structuredClone(users));

const userRepository: UserRepository = {
  async manage(supplierId, actorId, input) {
    const request = userManagementSchema.parse(input);
    const actor = userRecords.find(user => user.id === actorId && user.supplierId === supplierId && (user.status ?? "active") === "active");
    if (actor?.role !== "admin") throw new Error("FORBIDDEN");
    if (request.action === "invite") {
      if (userRecords.some(user => user.email.toLowerCase() === request.profile.email)) throw new Error("EMAIL_IN_USE");
      const user: User = { ...request.profile, id: `user-${randomUUID()}` as UserId, supplierId, status: "invited" };
      userRecords.push(user);
      return structuredClone(user);
    }
    const index = userRecords.findIndex(user => user.id === request.userId && user.supplierId === supplierId);
    if (index < 0) throw new Error("NOT_FOUND");
    const current = userRecords[index];
    if (request.action === "edit") {
      if (current.id === actorId && request.profile.role !== "admin") throw new Error("SELF_CHANGE");
      if (userRecords.some(user => user.id !== current.id && user.email.toLowerCase() === request.profile.email)) throw new Error("EMAIL_IN_USE");
      mockRecoveryStore.renameAccountEmail(current.email, request.profile.email);
      userRecords[index] = { ...current, ...request.profile };
    } else if (request.action === "deactivate" || request.action === "activate") {
      if (current.id === actorId) throw new Error("SELF_CHANGE");
      if (current.status === "invited") throw new Error("INVITATION_PENDING");
      userRecords[index] = { ...current, status: request.action === "activate" ? "active" : "inactive" };
    } else if ((current.status ?? "active") !== "active") throw new Error("USER_NOT_ACTIVE");
    return structuredClone(userRecords[index]);
  },
  async saveProfile(supplierId, userId, input) {
    const profile = accountSchema.parse(input);
    const index = userRecords.findIndex(user => user.id === userId && user.supplierId === supplierId);
    if (index < 0) throw new Error("ACCOUNT_NOT_FOUND");
    if (userRecords.some(user => user.id !== userId && user.email.toLowerCase() === profile.email)) throw new Error("EMAIL_IN_USE");
    const current = userRecords[index];
    mockRecoveryStore.renameAccountEmail(current.email, profile.email);
    const updated = { ...current, ...profile };
    userRecords[index] = updated;
    return structuredClone(updated);
  },
  async listForSupplier(supplierId: SupplierId) {
    return structuredClone(userRecords.filter((user) => user.supplierId === supplierId));
  },
  async getById(supplierId: SupplierId, userId: UserId) {
    const user = userRecords.find(
        (user) => user.supplierId === supplierId && user.id === userId,
      ) ?? null;
    return user ? structuredClone(user) : null;
  },
  async getByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = userRecords.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
    return user ? structuredClone(user) : null;
  },
};

const projectRepository: ProjectRepository = {
  async listForSupplier(supplierId: SupplierId) {
    return projects.filter((project) => project.supplierId === supplierId);
  },
  async getById(supplierId: SupplierId, projectId: ProjectId) {
    return (
      projects.find(
        (project) =>
          project.supplierId === supplierId && project.id === projectId,
      ) ?? null
    );
  },
};

const subsampleRepository: SubsampleRepository = {
  async listForSupplier(supplierId: SupplierId) {
    return structuredClone(
      contactState.subsamples.filter(
        (subsample) => subsample.supplierId === supplierId,
      ),
    );
  },
  async listByProject(supplierId: SupplierId, projectId: ProjectId) {
    return structuredClone(
      contactState.subsamples.filter(
        (subsample) =>
          subsample.supplierId === supplierId &&
          subsample.projectId === projectId,
      ),
    );
  },
  async getById(supplierId: SupplierId, subsampleId: SubsampleId) {
    return structuredClone(
      contactState.subsamples.find(
        (subsample) =>
          subsample.supplierId === supplierId && subsample.id === subsampleId,
      ) ?? null,
    );
  },
  async saveContacts(supplierId, projectId, subsampleId, input, actorId) {
    requireContactActor(supplierId, actorId);
    const setting = contactOverrideSchema.parse(input);
    const subsample = contactState.subsamples.find(
      (item) =>
        item.id === subsampleId &&
        item.projectId === projectId &&
        item.supplierId === supplierId,
    );
    if (!subsample) throw new Error("Subsample not found.");
    if (setting.mode === "override") {
      const options = contactState.options[supplierId] ?? emptyContacts();
      if (setting.value.some(id => !options.some(contact => contact.id === id))) {
        throw new Error("One or more contacts are unavailable. Reload and try again.");
      }
    }

    subsample.settingsOverrides = {
      ...subsample.settingsOverrides,
      contacts: setting,
    };
    return structuredClone(subsample);
  },
};

const reportRepository: ReportRepository = {
  async listForSupplier(supplierId: SupplierId) {
    return reportRecords.filter((report) => report.supplierId === supplierId);
  },
  async getById(supplierId: SupplierId, reportId: ReportId) {
    return (
      reportRecords.find(
        (report) => report.supplierId === supplierId && report.id === reportId,
      ) ?? null
    );
  },
  async create(report: Report) {
    if (reportRecords.some((record) => record.id === report.id)) {
      throw new Error(`Report ID already exists: ${report.id}`);
    }

    const supplier = suppliers.find(
      (record) => record.id === report.supplierId,
    );
    const requester = users.find(
      (record) =>
        record.id === report.requestedByUserId &&
        record.supplierId === report.supplierId,
    );
    const scopeTarget =
      report.scope.scopeType === "project"
        ? projects.find(
            (project) =>
              project.id === report.scope.projectId &&
              project.supplierId === report.supplierId,
          )
        : subsamples.find(
            (subsample) =>
              subsample.id === report.scope.subsampleId &&
              subsample.supplierId === report.supplierId,
          );

    if (!supplier || !requester || !scopeTarget) {
      throw new Error("Report supplier, requester, or scope is not valid.");
    }

    reportRecords.unshift(report);
    return report;
  },
};

const costRepository: CostRepository = {
  async listForSupplier(supplierId: SupplierId) {
    return costRecords.filter((cost) => cost.supplierId === supplierId);
  },
  async getById(supplierId: SupplierId, costId: CostId) {
    return (
      costRecords.find(
        (cost) => cost.supplierId === supplierId && cost.id === costId,
      ) ?? null
    );
  },
  async decideMany(supplierId, costIds, decision, actorId, note) {
    const actor = users.find(
      (user) =>
        user.id === actorId &&
        user.supplierId === supplierId &&
        user.role === "admin",
    );
    if (!actor)
      throw new Error("Only a supplier administrator may decide costs.");

    const uniqueIds = [...new Set(costIds)];
    if (uniqueIds.length === 0) throw new Error("Select at least one cost.");
    const selected = uniqueIds.map((id) =>
      costRecords.find(
        (cost) => cost.id === id && cost.supplierId === supplierId,
      ),
    );
    if (selected.some((cost) => !cost)) {
      throw new Error("One or more selected costs are unavailable.");
    }
    if (selected.some((cost) => cost?.status !== "pending_approval")) {
      throw new Error("Only pending costs can be approved or rejected.");
    }

    const decidedAt = new Date().toISOString();
    const updated = selected.map((cost) => ({
      ...cost!,
      status: decision,
      ipsosStatus:
        decision === "approved"
          ? ("published" as const)
          : ("rejected" as const),
      publishedAt: decision === "approved" ? decidedAt : cost!.publishedAt,
      approval: {
        status: decision,
        decidedAt,
        decidedByUserId: actorId,
        ...(note ? { note } : {}),
      },
    }));

    for (const updatedCost of updated) {
      const index = costRecords.findIndex((cost) => cost.id === updatedCost.id);
      costRecords[index] = updatedCost;
    }
    return updated;
  },
};

const settingsGlobal = globalThis as typeof globalThis & { __ipsosSupplierPreferences?: Record<string, SettingsValues> };
const preferences = (settingsGlobal.__ipsosSupplierPreferences ??= {});

export const mockRepositories: PortalRepositories = {
  settings: {
    async get(supplierId) {
      const supplier = contactState.suppliers.find(item => item.id === supplierId);
      if (!supplier) throw new Error("NOT_FOUND");
      return structuredClone(preferences[supplierId] ?? defaultSettings(supplier.name));
    },
    async save(supplierId, actorId, section, input) {
      const actor = userRecords.find(user => user.id === actorId && user.supplierId === supplierId && (user.status ?? "active") === "active");
      if (actor?.role !== "admin") throw new Error("FORBIDDEN");
      const values = settingsSchema.parse(input);
      const supplier = contactState.suppliers.find(item => item.id === supplierId);
      if (!supplier) throw new Error("NOT_FOUND");
      const current = preferences[supplierId] ?? defaultSettings(supplier.name);
      const next = { ...current, [section]: structuredClone(values[section]) };
      preferences[supplierId] = next;
      if (section === "organization") supplier.name = values.organization.companyName;
      return structuredClone(next);
    },
  },
  suppliers: supplierRepository,
  users: userRepository,
  projects: projectRepository,
  subsamples: subsampleRepository,
  reports: reportRepository,
  costs: costRepository,
};
