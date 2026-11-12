export type ProjectStatus = "live" | "pending" | "closed" | "canceled";

export type SubsampleStatus = "live" | "pending" | "closed" | "canceled";

export type ReportStatus = "queued" | "executing" | "finished" | "error";

export type CostStatus = "pending_approval" | "approved" | "rejected";
export const statusLabels = { live: "Live", pending: "Pending", canceled: "Cancelled", closed: "Closed" };
export const statusTextStyles = { live: "text-emerald-800", pending: "text-sky-700", canceled: "text-red-700", closed: "text-gray-600" };
export const statusBadgeStyles = { live: "border-emerald-200 bg-emerald-50 text-emerald-800", pending: "border-sky-200 bg-sky-50 text-sky-700", canceled: "border-red-200 bg-red-50 text-red-700", closed: "border-gray-200 bg-gray-100 text-gray-600" };
export function isProjectStatus(value: string): value is ProjectStatus { return Object.hasOwn(statusLabels, value); }
