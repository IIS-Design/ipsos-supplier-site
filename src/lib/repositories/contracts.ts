import type { SettingsValues, EditableSettingsSection, UserManagementRequest } from "@/features/settings/settings-model";
import type { AccountProfile } from "@/features/account/account-model";
import type {
  CostId,
  ProjectId,
  ReportId,
  SubsampleId,
  SupplierId,
  UserId,
} from "@/types/ids";
import type { Cost } from "@/types/cost";
import type { Project } from "@/types/project";
import type { Report } from "@/types/report";
import type { Subsample } from "@/types/subsample";
import type { Supplier, SupplierContacts } from "@/types/supplier";
import type { SubsampleContactOverrides } from "@/types/subsample";
import type { SettingOverride } from "@/types/scopes";
import type { User } from "@/types/user";

export interface SupplierRepository {
  list(): Promise<Supplier[]>;
  getById(supplierId: SupplierId): Promise<Supplier | null>;
  listContactOptions(supplierId: SupplierId): Promise<SupplierContacts>;
  saveContactDefaults(
    supplierId: SupplierId,
    contacts: SupplierContacts,
    actorId: UserId,
  ): Promise<SupplierContacts>;
}

export interface UserRepository {
  manage(supplierId: SupplierId, actorId: UserId, request: UserManagementRequest): Promise<User>;
  saveProfile(supplierId: SupplierId, userId: UserId, profile: AccountProfile): Promise<User>;
  listForSupplier(supplierId: SupplierId): Promise<User[]>;
  getById(supplierId: SupplierId, userId: UserId): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
}

export interface ProjectRepository {
  listForSupplier(supplierId: SupplierId): Promise<Project[]>;
  getById(
    supplierId: SupplierId,
    projectId: ProjectId,
  ): Promise<Project | null>;
}

export interface SubsampleRepository {
  listForSupplier(supplierId: SupplierId): Promise<Subsample[]>;
  listByProject(
    supplierId: SupplierId,
    projectId: ProjectId,
  ): Promise<Subsample[]>;
  getById(
    supplierId: SupplierId,
    subsampleId: SubsampleId,
  ): Promise<Subsample | null>;
  saveContacts(
    supplierId: SupplierId,
    projectId: ProjectId,
    subsampleId: SubsampleId,
    setting: SettingOverride<SubsampleContactOverrides>,
    actorId: UserId,
  ): Promise<Subsample>;
}

export interface ReportRepository {
  listForSupplier(supplierId: SupplierId): Promise<Report[]>;
  getById(supplierId: SupplierId, reportId: ReportId): Promise<Report | null>;
  create(report: Report): Promise<Report>;
}

export interface CostRepository {
  listForSupplier(supplierId: SupplierId): Promise<Cost[]>;
  getById(supplierId: SupplierId, costId: CostId): Promise<Cost | null>;
  decideMany(
    supplierId: SupplierId,
    costIds: CostId[],
    decision: "approved" | "rejected",
    actorId: UserId,
    note?: string,
  ): Promise<Cost[]>;
}

export interface SettingsRepository {
  get(supplierId: SupplierId): Promise<SettingsValues>;
  save(supplierId: SupplierId, actorId: UserId, section: EditableSettingsSection, values: SettingsValues): Promise<SettingsValues>;
}

export type PortalRepositories = {
  settings: SettingsRepository;
  suppliers: SupplierRepository;
  users: UserRepository;
  projects: ProjectRepository;
  subsamples: SubsampleRepository;
  reports: ReportRepository;
  costs: CostRepository;
};
