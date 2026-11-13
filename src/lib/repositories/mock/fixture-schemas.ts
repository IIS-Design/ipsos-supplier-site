import { redirectOverrideSchema, serverToServerOverrideSchema } from "@/features/settings/integration-model";
import { contactsSchema, contactOverrideSchema } from "@/features/contacts/contact-model";
import { z } from "zod";
import type {
  CostId,
  JobBookNumber,
  ProjectId,
  ReportId,
  SubsampleId,
  SupplierId,
  SurveyEventId,
  UserId,
} from "@/types/ids";

const id = <Brand extends string>() =>
  z
    .string()
    .min(1)
    .transform((value) => value as Brand);

const supplierIdSchema = id<SupplierId>();
const userIdSchema = id<UserId>();
const projectIdSchema = id<ProjectId>();
const subsampleIdSchema = id<SubsampleId>();
const reportIdSchema = id<ReportId>();
const costIdSchema = id<CostId>();
const surveyEventIdSchema = id<SurveyEventId>();
const jobBookNumberSchema = id<JobBookNumber>();

const supplierContactsSchema = contactsSchema;

const settingsSchema = z
  .object({
    contacts: supplierContactsSchema.optional(),
    redirects: z.record(z.string(), z.unknown()).optional(),
    serverToServer: z.record(z.string(), z.unknown()).optional(),
    security: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const projectScopeSchema = z
  .object({
    scopeType: z.literal("project"),
    projectId: projectIdSchema,
  })
  .strict();

const subsampleScopeSchema = z
  .object({
    scopeType: z.literal("subsample"),
    subsampleId: subsampleIdSchema,
  })
  .strict();

const scopeSchema = z.discriminatedUnion("scopeType", [
  projectScopeSchema,
  subsampleScopeSchema,
]);

const settingOverrideSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("inherit") }).strict(),
  z
    .object({
      mode: z.literal("override"),
      value: z.record(z.string(), z.unknown()),
    })
    .strict(),
]);

export const supplierSchema = z
  .object({
    id: supplierIdSchema,
    name: z.string().min(1),
    settings: settingsSchema,
  })
  .strict();

export const userSchema = z
  .object({
    id: userIdSchema,
    supplierId: supplierIdSchema,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    role: z.enum(["admin", "user"]),
    status: z.enum(["active", "invited", "inactive"]).optional(),
  })
  .strict();

export const projectSchema = z
  .object({
    id: projectIdSchema,
    supplierId: supplierIdSchema,
    surveyEventId: surveyEventIdSchema,
    name: z.string().min(1),
    status: z.enum(["live", "pending", "closed", "canceled"]),
    billingEntity: z.string().optional(),
    deviceCompatibility: z.object({ mobile: z.boolean(), tablet: z.boolean(), desktop: z.boolean() }).strict().optional(),
    categoryPaths: z.array(z.array(z.string().trim().min(1)).min(1)).optional(),
  })
  .strict();

export const subsampleSchema = z
  .object({
    id: subsampleIdSchema,
    supplierId: supplierIdSchema,
    projectId: projectIdSchema,
    name: z.string().min(1),
    status: z.enum(["live", "pending", "closed", "canceled"]),
    language: z.string().min(1),
    languages: z.array(z.string().min(1)).min(1).optional(),
    jobBookNumber: jobBookNumberSchema.optional(),
    researchType: z.string().trim().min(1).optional(),
    country: z.string().min(1),
    router: z.string().nullable(),
    fieldStartDate: z.iso.date(),
    fieldEndDate: z.iso.date(),
    configurationSummary: z.object({
      customCpi: z.boolean(),
      personalIdentifiableInfo: z.boolean(),
      facialCoding: z.boolean(),
      marketplaceEnabled: z.boolean(),
    }).strict().optional(),
    ipsosContact: z.string().optional(),
    ipsosContacts: z.array(z.object({ name: z.string(), email: z.email() }).strict()).optional(),
    entryLinks: z.array(z.object({ language: z.string().min(1), live: z.url().optional(), testing: z.url().optional() }).strict()).optional(),
    incidence: z.number().nonnegative(),
    visitors: z.number().int().nonnegative(),
    loi: z.number().nonnegative(),
    abandonRate: z.number().min(0).max(100).optional(),
    expectedMetrics: z.object({
      incidence: z.number().min(0).max(100).optional(),
      loi: z.number().nonnegative().optional(),
      conversion: z.number().min(0).max(100).optional(),
      abandonRate: z.number().min(0).max(100).optional(),
    }).strict().optional(),
    quotaTables: z.array(z.object({
      id: z.string().min(1), name: z.string().min(1), variables: z.array(z.string().min(1)),
      rows: z.array(z.object({ quotaGroup: z.string().min(1), achieved: z.number().int().nonnegative(), exclusiveRemaining: z.number().int().nonnegative(), sharedRemaining: z.number().int().nonnegative() }).strict()),
    }).strict()).optional(),
    achievedCompletes: z.number().int().nonnegative(),
    exclusiveRemaining: z.number().int().nonnegative(),
    sharedRemaining: z.number().int().nonnegative(),
    quotaBreakdown: z
      .array(
        z
          .object({
            quotaGroup: z.string().min(1),
            achieved: z.number().int().nonnegative(),
            exclusiveRemaining: z.number().int().nonnegative(),
            sharedRemaining: z.number().int().nonnegative(),
          })
          .strict(),
      )
      .optional(),
    settingsOverrides: z
      .object({
        contacts: contactOverrideSchema.optional(),
        redirects: redirectOverrideSchema.optional(),
        serverToServer: serverToServerOverrideSchema.optional(),
        security: settingOverrideSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const reportSchema = z
  .object({
    id: reportIdSchema,
    supplierId: supplierIdSchema,
    scope: z.union([scopeSchema, z.object({ scopeType: z.literal("supplier") }).strict(), z.object({ scopeType: z.literal("subsamples"), subsampleIds: z.array(subsampleIdSchema).min(1).max(10) }).strict()]),
    type: z.enum(["respondent_info", "survey_duration", "mini_router_quota"]),
    status: z.enum(["queued", "executing", "finished", "error"]),
    requestedByUserId: userIdSchema,
    createdAt: z.iso.datetime(),
    startedAt: z.iso.datetime().optional(),
    finishedAt: z.iso.datetime().optional(),
    parameters: z.record(z.string(), z.unknown()).optional(),
    downloadUrl: z.string().optional(),
    errorMessage: z.string().optional(),
  })
  .strict();

export const costSchema = z
  .object({
    id: costIdSchema,
    supplierId: supplierIdSchema,
    scope: scopeSchema,
    completes: z.number().int().nonnegative(),
    cpi: z.number().nonnegative(),
    totalCost: z.number().nonnegative(),
    currency: z.string().length(3),
    status: z.enum(["pending_approval", "approved", "rejected"]),
    country: z.string().min(1),
    supplierProjectId: z.string().min(1),
    billingMode: z.enum(["project_level", "survey_level"]),
    apiEnabled: z.boolean(),
    discountAmount: z.number().nonnegative().optional(),
    discountReason: z.string().optional(),
    publishedAt: z.iso.datetime().optional(),
    supplierStatus: z.enum(["default", "submitted"]).optional(),
    ipsosStatus: z.enum(["pending", "published", "rejected"]).optional(),
    approval: z
      .object({
        status: z.enum(["approved", "rejected"]),
        decidedAt: z.iso.datetime(),
        decidedByUserId: userIdSchema,
        note: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
