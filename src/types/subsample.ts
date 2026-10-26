import type { ProjectId, SubsampleId, SupplierId } from "./ids";
import type { SettingOverride } from "./scopes";
import type { SubsampleStatus } from "./status";

export type QuotaBreakdownRow = {
  quotaGroup: string;
  achieved: number;
  exclusiveRemaining: number;
  sharedRemaining: number;
};

export type SubsampleContactOverrides = string[];

export type SubsampleSettingsOverrides = {
  contacts?: SettingOverride<SubsampleContactOverrides>;
  redirects?: SettingOverride<Record<string, unknown>>;
  serverToServer?: SettingOverride<Record<string, unknown>>;
  security?: SettingOverride<Record<string, unknown>>;
};

/** Operational supplier entity; projectId is its canonical parent reference. */
export type Subsample = {
  id: SubsampleId;
  supplierId: SupplierId;
  projectId: ProjectId;
  name: string;
  status: SubsampleStatus;
  language: string;
  country: string;
  router: string | null;
  fieldStartDate: string;
  fieldEndDate: string;
  invoiceEntity?: string;
  ipsosContact?: string;
  incidence: number;
  visitors: number;
  loi: number;
  achievedCompletes: number;
  exclusiveRemaining: number;
  sharedRemaining: number;
  quotaBreakdown?: QuotaBreakdownRow[];
  /** Missing sections inherit Supplier defaults; present sections may override. */
  settingsOverrides?: SubsampleSettingsOverrides;
};
