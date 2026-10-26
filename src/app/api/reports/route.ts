import { NextResponse } from "next/server";
import { z } from "zod";
import { createReport } from "@/services/report-service";
import { getCurrentUser } from "@/lib/auth/session";
import type { ProjectId, SubsampleId } from "@/types/ids";
import type { ReportScope } from "@/types/scopes";
import type { ReportType } from "@/types/report";

const scopeSchema = z.discriminatedUnion("scopeType", [
  z
    .object({ scopeType: z.literal("project"), projectId: z.string().min(1) })
    .strict(),
  z
    .object({
      scopeType: z.literal("subsample"),
      subsampleId: z.string().min(1),
    })
    .strict(),
]);

const createReportSchema = z
  .object({
    type: z.enum(["respondent_info", "survey_duration", "mini_router_quota"]),
    scope: scopeSchema,
    dateFrom: z.iso.datetime().optional(),
    dateTo: z.iso.datetime().optional(),
    respondentStatus: z.string().max(100).optional(),
    respondentSubstatus: z.string().max(100).optional(),
    linkType: z.enum(["live_users", "proofing_users"]).optional(),
    reportType: z.enum(["final_status", "entered_survey"]).optional(),
    uploadUrl: z.union([z.url(), z.literal("")]).optional(),
    includePartialResponses: z.boolean().optional(),
    includeClosedQuotas: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (Boolean(value.dateFrom) !== Boolean(value.dateTo)) {
      context.addIssue({
        code: "custom",
        message: "Select both dates for the report range.",
        path: [value.dateFrom ? "dateTo" : "dateFrom"],
      });
    }
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      context.addIssue({
        code: "custom",
        message: "The start date must be before the end date.",
        path: ["dateTo"],
      });
    }
    if (
      value.type === "respondent_info" &&
      (value.linkType === undefined || value.reportType === undefined)
    ) {
      context.addIssue({
        code: "custom",
        message: "Choose a link type and report type.",
        path: ["reportType"],
      });
    }
  });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Sign in to create a report." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid report request." },
      { status: 400 },
    );
  }

  const result = createReportSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        message: "Check the report details and try again.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const values = result.data;
  const scope: ReportScope =
    values.scope.scopeType === "project"
      ? { scopeType: "project", projectId: values.scope.projectId as ProjectId }
      : {
          scopeType: "subsample",
          subsampleId: values.scope.subsampleId as SubsampleId,
        };

  const parameters: Record<string, unknown> = {};
  if (values.dateFrom) parameters.dateFrom = values.dateFrom;
  if (values.dateTo) parameters.dateTo = values.dateTo;
  if (values.respondentStatus)
    parameters.respondentStatus = values.respondentStatus;
  if (values.respondentSubstatus)
    parameters.respondentSubstatus = values.respondentSubstatus;
  if (values.linkType) parameters.linkType = values.linkType;
  if (values.reportType) parameters.reportType = values.reportType;
  if (values.uploadUrl) parameters.uploadUrl = values.uploadUrl;
  if (values.includePartialResponses !== undefined)
    parameters.includePartialResponses = values.includePartialResponses;
  if (values.includeClosedQuotas !== undefined)
    parameters.includeClosedQuotas = values.includeClosedQuotas;

  try {
    const report = await createReport({
      supplierId: user.supplierId,
      requestedByUserId: user.id,
      scope,
      type: values.type as ReportType,
      parameters,
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Unable to create report", error);
    return NextResponse.json(
      { message: "The report could not be queued. Please try again." },
      { status: 400 },
    );
  }
}
