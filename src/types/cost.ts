import type { CostId, SupplierId, UserId } from "./ids";
import type { CostScope } from "./scopes";
import type { CostStatus } from "./status";

export type BillingMode = "project_level" | "survey_level";

export type CostApproval = {
  status: Exclude<CostStatus, "pending_approval">;
  decidedAt: string;
  decidedByUserId: UserId;
  note?: string;
};

export type SupplierCostStatus = "default" | "submitted";
export type IpsosCostStatus = "pending" | "published" | "rejected";

export type Cost = {
  id: CostId;
  supplierId: SupplierId;
  scope: CostScope;
  completes: number;
  cpi: number;
  totalCost: number;
  currency: string;
  status: CostStatus;
  country: string;
  supplierProjectId: string;
  billingMode: BillingMode;
  apiEnabled: boolean;
  discountAmount?: number;
  discountReason?: string;
  publishedAt?: string;
  supplierStatus?: SupplierCostStatus;
  ipsosStatus?: IpsosCostStatus;
  approval?: CostApproval;
};
