import "server-only";

import costsJson from "@/data/costs.json";
import projectsJson from "@/data/projects.json";
import reportsJson from "@/data/reports.json";
import subsamplesJson from "@/data/subsamples.json";
import suppliersJson from "@/data/suppliers.json";
import usersJson from "@/data/users.json";
import type { Cost } from "@/types/cost";
import type { Project } from "@/types/project";
import type { Report } from "@/types/report";
import type { Subsample } from "@/types/subsample";
import type { Supplier } from "@/types/supplier";
import type { User } from "@/types/user";
import {
  costSchema,
  projectSchema,
  reportSchema,
  subsampleSchema,
  supplierSchema,
  userSchema,
} from "./fixture-schemas";

function parseFixture<T>(
  name: string,
  source: unknown,
  schema: { array: () => { parse: (input: unknown) => T[] } },
): T[] {
  try {
    return schema.array().parse(source);
  } catch (error) {
    throw new Error(
      `Invalid ${name} fixture: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export const suppliers = parseFixture<Supplier>(
  "supplier",
  suppliersJson,
  supplierSchema,
);
export const users = parseFixture<User>("user", usersJson, userSchema);
export const projects = parseFixture<Project>(
  "project",
  projectsJson,
  projectSchema,
);
export const subsamples = parseFixture<Subsample>(
  "subsample",
  subsamplesJson,
  subsampleSchema,
);
export const reports = parseFixture<Report>(
  "report",
  reportsJson,
  reportSchema,
);
export const costs = parseFixture<Cost>("cost", costsJson, costSchema);

function assertUniqueIds<T extends { id: string }>(
  name: string,
  records: T[],
): void {
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.id))
      throw new Error(`Duplicate ${name} ID in fixtures: ${record.id}`);
    seen.add(record.id);
  }
}

function assertSupplierOwnership<T extends { id: string; supplierId: string }>(
  entityName: string,
  records: T[],
  supplierIds: Set<string>,
): void {
  for (const record of records) {
    if (!supplierIds.has(record.supplierId)) {
      throw new Error(
        `${entityName} ${record.id} references missing supplier ${record.supplierId}`,
      );
    }
  }
}

function validateRelationships(): void {
  assertUniqueIds("supplier", suppliers);
  assertUniqueIds("user", users);
  assertUniqueIds("project", projects);
  assertUniqueIds("subsample", subsamples);
  assertUniqueIds("report", reports);
  assertUniqueIds("cost", costs);

  const supplierIds = new Set(suppliers.map(({ id }) => id));
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const subsampleById = new Map(
    subsamples.map((subsample) => [subsample.id, subsample]),
  );
  const userById = new Map(users.map((user) => [user.id, user]));

  assertSupplierOwnership("User", users, supplierIds);
  assertSupplierOwnership("Project", projects, supplierIds);
  assertSupplierOwnership("Subsample", subsamples, supplierIds);
  assertSupplierOwnership("Report", reports, supplierIds);
  assertSupplierOwnership("Cost", costs, supplierIds);

  for (const subsample of subsamples) {
    const project = projectById.get(subsample.projectId);
    if (!project)
      throw new Error(
        `Subsample ${subsample.id} references missing project ${subsample.projectId}`,
      );
    if (project.supplierId !== subsample.supplierId) {
      throw new Error(
        `Subsample ${subsample.id} and its project belong to different suppliers`,
      );
    }
  }

  for (const project of projects) {
    if (!subsamples.some((subsample) => subsample.projectId === project.id)) {
      throw new Error(`Project ${project.id} has no subsample fixture`);
    }
  }

  const validateScopedRecord = (entityName: string, record: Report | Cost) => {
    const target =
      record.scope.scopeType === "project"
        ? projectById.get(record.scope.projectId)
        : subsampleById.get(record.scope.subsampleId);
    if (!target)
      throw new Error(
        `${entityName} ${record.id} references a missing scoped record`,
      );
    if (target.supplierId !== record.supplierId) {
      throw new Error(
        `${entityName} ${record.id} and its scope belong to different suppliers`,
      );
    }
  };

  for (const report of reports) {
    validateScopedRecord("Report", report);
    const requester = userById.get(report.requestedByUserId);
    if (!requester)
      throw new Error(
        `Report ${report.id} references missing requester ${report.requestedByUserId}`,
      );
    if (requester.supplierId !== report.supplierId) {
      throw new Error(
        `Report ${report.id} and its requester belong to different suppliers`,
      );
    }
  }

  for (const cost of costs) {
    validateScopedRecord("Cost", cost);
    if (!cost.approval) continue;
    const approver = userById.get(cost.approval.decidedByUserId);
    if (!approver)
      throw new Error(
        `Cost ${cost.id} references missing approver ${cost.approval.decidedByUserId}`,
      );
    if (approver.supplierId !== cost.supplierId || approver.role !== "admin") {
      throw new Error(`Cost ${cost.id} has an invalid approval actor`);
    }
    if (cost.status !== cost.approval.status) {
      throw new Error(
        `Cost ${cost.id} status does not match its approval record`,
      );
    }
  }
}

validateRelationships();
