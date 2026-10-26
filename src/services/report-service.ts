import { nextReportId } from "./report-identifiers";
import { getRepositories } from "@/lib/repositories";
import type { ReportId, SupplierId } from "@/types/ids";
import type { NewReport } from "@/types/report";

export const getReports = (supplierId: SupplierId) =>
  getRepositories().reports.listForSupplier(supplierId);

export const getReport = (supplierId: SupplierId, reportId: ReportId) =>
  getRepositories().reports.getById(supplierId, reportId);

export const createReport = (report: NewReport) =>
  getRepositories().reports.create({
    ...report,
    id: nextReportId(),
    status: "queued",
    createdAt: new Date().toISOString(),
  });
