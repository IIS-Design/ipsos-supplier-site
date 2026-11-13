import type { RedirectValues, ServerToServerValues } from "@/features/settings/integration-model";
import type { JobBookNumber, ProjectId, SubsampleId, SupplierId } from "./ids";
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
  redirects?: SettingOverride<RedirectValues>;
  serverToServer?: SettingOverride<ServerToServerValues>;
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
  /** Multiple fieldwork languages; language remains a compatibility fallback. */
  languages?: string[];
  jobBookNumber?: JobBookNumber;
  researchType?: string;
  country: string;
  router: string | null;
  fieldStartDate: string;
  fieldEndDate: string;
  /** Read-only prototype configuration indicators shown in the approved Details design. */
  configurationSummary?: {
    customCpi: boolean;
    personalIdentifiableInfo: boolean;
    facialCoding: boolean;
    marketplaceEnabled: boolean;
  };
  ipsosContact?: string;
  ipsosContacts?: { name: string; email: string }[];
  entryLinks?: { language: string; live?: string; testing?: string }[];
  incidence: number;
  visitors: number;
  loi: number;
  /** Supplied rate, not derived from Visitors. Percentages use the 0–100 scale. */
  abandonRate?: number;
  expectedMetrics?: { incidence?: number; loi?: number; conversion?: number; abandonRate?: number };
  quotaTables?: { id: string; name: string; variables: string[]; rows: QuotaBreakdownRow[] }[];
  achievedCompletes: number;
  exclusiveRemaining: number;
  sharedRemaining: number;
  quotaBreakdown?: QuotaBreakdownRow[];
  /** Missing sections inherit Supplier defaults; present sections may override. */
  settingsOverrides?: SubsampleSettingsOverrides;
};

export function subsampleLanguages(subsample: Pick<Subsample, "language" | "languages">): string[] {
  return subsample.languages?.length ? subsample.languages : [subsample.language];
}

export function getIpsosContacts(subsample: Pick<Subsample, "ipsosContact" | "ipsosContacts">) {
  return subsample.ipsosContacts ?? (subsample.ipsosContact ? [{ name: "", email: subsample.ipsosContact }] : []);
}
