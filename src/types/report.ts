import type { ReportId, SupplierId, UserId } from "./ids";
import type { ReportScope } from "./scopes";
import type { ReportStatus } from "./status";

export type ReportType =
  | "respondent_info"
  | "survey_duration"
  | "mini_router_quota";

export type Report = {
  id: ReportId;
  supplierId: SupplierId;
  scope: ReportScope;
  type: ReportType;
  status: ReportStatus;
  requestedByUserId: UserId;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  parameters?: Record<string, unknown>;
  downloadUrl?: string;
  errorMessage?: string;
};

export type NewReport = Omit<
  Report,
  | "id"
  | "status"
  | "createdAt"
  | "startedAt"
  | "finishedAt"
  | "downloadUrl"
  | "errorMessage"
>;
