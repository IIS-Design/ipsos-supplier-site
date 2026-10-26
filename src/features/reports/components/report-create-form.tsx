"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import { ArrowLeft, ChevronDown, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import type { Project } from "@/types/project";
import type { ReportType } from "@/types/report";
import type { Subsample } from "@/types/subsample";

type ReportScopeChoice = {
  key: string;
  label: string;
  scopeType: "project" | "subsample";
  targetId: string;
};

const reportTypes: { id: ReportType; label: string; description: string }[] = [
  {
    id: "respondent_info",
    label: "Respondent Info Report",
    description: "Export respondent-level information for a selected survey.",
  },
  {
    id: "survey_duration",
    label: "Survey Duration Report",
    description: "Review survey duration data for a selected survey.",
  },
  {
    id: "mini_router_quota",
    label: "Mini-Router Quota Report",
    description: "Export quota progress for a selected survey.",
  },
];

const formSchema = z
  .object({
    reportType: z.enum([
      "respondent_info",
      "survey_duration",
      "mini_router_quota",
    ]),
    scopeKey: z.string().min(1, "Select a project or subsample."),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    respondentStatus: z.string().optional(),
    respondentSubstatus: z.string().optional(),
    liveUsers: z.boolean(),
    proofingUsers: z.boolean(),
    finalStatus: z.boolean(),
    enteredSurvey: z.boolean(),
    uploadUrl: z.string().optional(),
    includePartialResponses: z.boolean(),
    includeClosedQuotas: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.dateFrom) !== Boolean(value.dateTo)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter both dates for the date range.",
        path: [value.dateFrom ? "dateTo" : "dateFrom"],
      });
    }
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      ctx.addIssue({
        code: "custom",
        message: "Start date must be on or before end date.",
        path: ["dateTo"],
      });
    }
    if (
      value.reportType === "respondent_info" &&
      !value.liveUsers &&
      !value.proofingUsers
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one link type.",
        path: ["liveUsers"],
      });
    }
    if (
      value.reportType === "respondent_info" &&
      !value.finalStatus &&
      !value.enteredSurvey
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one report type.",
        path: ["finalStatus"],
      });
    }
    if (value.uploadUrl) {
      const result = z.url().safeParse(value.uploadUrl);
      if (!result.success)
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid upload URL.",
          path: ["uploadUrl"],
        });
    }
  });

type FormValues = z.infer<typeof formSchema>;

function toIsoStart(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}
function toIsoEnd(date: string) {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export function ReportCreateForm({
  projects,
  subsamples,
  requestedType,
}: {
  projects: Project[];
  subsamples: Subsample[];
  requestedType?: string;
}) {
  const router = useRouter();
  const initialType = reportTypes.some((item) => item.id === requestedType)
    ? (requestedType as ReportType)
    : "respondent_info";
  const defaultScope = subsamples.find((item) => item.status === "live")
    ? `subsample:${subsamples.find((item) => item.status === "live")!.id}`
    : projects[0]
      ? `project:${projects[0].id}`
      : "";
  const [initialValues] = useState<FormValues>({
    reportType: initialType,
    scopeKey: defaultScope,
    dateFrom: "",
    dateTo: "",
    respondentStatus: "",
    respondentSubstatus: "",
    liveUsers: true,
    proofingUsers: false,
    finalStatus: true,
    enteredSurvey: false,
    uploadUrl: "",
    includePartialResponses: false,
    includeClosedQuotas: false,
  });
  const [values, setValues] = useState<FormValues>(initialValues);
  const [queued, setQueued] = useState(false);
  const releaseNavigation = useUnsavedChanges(
    !queued && JSON.stringify(values) !== JSON.stringify(initialValues),
    "You have unsaved report options. Leave this page and discard them?",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const scopeChoices: ReportScopeChoice[] = [
    ...projects.map((project) => ({
      key: `project:${project.id}`,
      label: `${project.name} (Project)`,
      scopeType: "project" as const,
      targetId: project.id,
    })),
    ...subsamples.map((subsample) => ({
      key: `subsample:${subsample.id}`,
      label: `${subsample.name} (Subsample)`,
      scopeType: "subsample" as const,
      targetId: subsample.id,
    })),
  ];

  const setField = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        nextErrors[key] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    const selectedScope = scopeChoices.find(
      (item) => item.key === values.scopeKey,
    );
    if (!selectedScope) {
      setErrors({ scopeKey: "Select a project or subsample." });
      return;
    }

    const body = {
      type: values.reportType,
      scope:
        selectedScope.scopeType === "project"
          ? { scopeType: "project", projectId: selectedScope.targetId }
          : { scopeType: "subsample", subsampleId: selectedScope.targetId },
      ...(values.dateFrom
        ? {
            dateFrom: toIsoStart(values.dateFrom),
            dateTo: toIsoEnd(values.dateTo!),
          }
        : {}),
      ...(values.respondentStatus
        ? { respondentStatus: values.respondentStatus }
        : {}),
      ...(values.respondentSubstatus
        ? { respondentSubstatus: values.respondentSubstatus }
        : {}),
      ...(values.reportType === "respondent_info"
        ? {
            linkType: values.liveUsers ? "live_users" : "proofing_users",
            reportType: values.finalStatus ? "final_status" : "entered_survey",
            uploadUrl: values.uploadUrl,
          }
        : {}),
      ...(values.reportType === "respondent_info"
        ? { includePartialResponses: values.includePartialResponses }
        : {}),
      ...(values.reportType === "mini_router_quota"
        ? { includeClosedQuotas: values.includeClosedQuotas }
        : {}),
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const responseBody = (await response.json()) as {
        message?: string;
        report?: { id: string };
      };
      if (!response.ok) {
        setSubmitError(
          responseBody.message ??
            "The report could not be queued. Please try again.",
        );
        return;
      }
      releaseNavigation();
      setQueued(true);
      const created = responseBody.report?.id;
      router.push(
        created
          ? `/reports?view=queue&created=${encodeURIComponent(created)}`
          : "/reports?view=queue",
      );
      router.refresh();
    } catch {
      setSubmitError("Unable to connect to the service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showRespondentOptions = values.reportType === "respondent_info";

  return (
    <form
      className="mx-auto w-full max-w-3xl space-y-6"
      noValidate
      onSubmit={submit}
    >
      <header className="space-y-2">
        <Button
          asChild
          className="-ml-2 px-2 text-muted-foreground"
          variant="ghost"
        >
          <Link href="/reports">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Reports
          </Link>
        </Button>
        <div>
          <h1 className="text-base font-medium leading-5">
            {reportTypes.find((item) => item.id === values.reportType)?.label}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure report scope and options.
          </p>
        </div>
      </header>

      {submitError ? (
        <div
          className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          role="alert"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {submitError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="report-type">
          Report Type
        </label>
        <Select
          onValueChange={(value) => setField("reportType", value as ReportType)}
          value={values.reportType}
        >
          <SelectTrigger
            aria-label="Report Type"
            id="report-type"
            className="w-full"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reportTypes.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {
            reportTypes.find((item) => item.id === values.reportType)
              ?.description
          }
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="report-scope">
          Survey / Project
        </label>
        <Select
          onValueChange={(value) => setField("scopeKey", value)}
          value={values.scopeKey}
        >
          <SelectTrigger
            aria-label="Select survey or project"
            id="report-scope"
            className="w-full"
          >
            <SelectValue placeholder="Search by Survey ID or name..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem
                key={`project:${project.id}`}
                value={`project:${project.id}`}
              >
                {project.name} · Event {project.surveyEventId}
              </SelectItem>
            ))}
            {subsamples.map((subsample) => (
              <SelectItem
                key={`subsample:${subsample.id}`}
                value={`subsample:${subsample.id}`}
              >
                {subsample.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.scopeKey ? (
          <p className="text-sm text-rose-800" role="alert">
            {errors.scopeKey}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Date Range</legend>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <label className="space-y-1 text-sm">
            <span className="sr-only">Start date</span>
            <Input
              aria-label="Start date"
              onChange={(event) => setField("dateFrom", event.target.value)}
              type="date"
              value={values.dateFrom}
            />
          </label>
          <span className="text-center text-sm text-muted-foreground">to</span>
          <label className="space-y-1 text-sm">
            <span className="sr-only">End date</span>
            <Input
              aria-label="End date"
              onChange={(event) => setField("dateTo", event.target.value)}
              type="date"
              value={values.dateTo}
            />
          </label>
        </div>
        {errors.dateFrom ? (
          <p className="text-sm text-rose-800" role="alert">
            {errors.dateFrom}
          </p>
        ) : null}
        {errors.dateTo ? (
          <p className="text-sm text-rose-800" role="alert">
            {errors.dateTo}
          </p>
        ) : null}
      </fieldset>

      {showRespondentOptions ? (
        <details className="rounded-lg border" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Advanced Options{" "}
            <ChevronDown aria-hidden="true" className="size-4" />
          </summary>
          <Separator />
          <div className="space-y-5 p-4">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Respondent Status</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className="space-y-1.5 text-sm"
                  htmlFor="respondent-status"
                >
                  <span className="block text-muted-foreground">Status</span>
                  <Select
                    onValueChange={(value) =>
                      setField("respondentStatus", value === "all" ? "" : value)
                    }
                    value={values.respondentStatus || "all"}
                  >
                    <SelectTrigger
                      aria-label="Respondent Status"
                      id="respondent-status"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="screened_out">Screened Out</SelectItem>
                      <SelectItem value="quota_full">Quota Full</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label
                  className="space-y-1.5 text-sm"
                  htmlFor="respondent-substatus"
                >
                  <span className="block text-muted-foreground">Substatus</span>
                  <Select
                    onValueChange={(value) =>
                      setField(
                        "respondentSubstatus",
                        value === "all" ? "" : value,
                      )
                    }
                    value={values.respondentSubstatus || "all"}
                  >
                    <SelectTrigger
                      aria-label="Respondent Substatus"
                      id="respondent-substatus"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All substatuses</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="disqualified">Disqualified</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Link Type</legend>
              <RadioGroup
                aria-label="Link Type"
                className="grid gap-2 sm:grid-cols-2"
                onValueChange={(value) => {
                  setField("liveUsers", value === "live");
                  setField("proofingUsers", value === "proofing");
                }}
                value={values.liveUsers ? "live" : "proofing"}
              >
                <ChoiceCard
                  description="Data from real respondents."
                  id="live-users"
                  label="Live Users"
                  value="live"
                />
                <ChoiceCard
                  description="Data from test users."
                  id="proofing-users"
                  label="Proofing Users"
                  value="proofing"
                />
              </RadioGroup>
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Report Type</legend>
              <RadioGroup
                aria-label="Respondent report type"
                className="grid gap-2 sm:grid-cols-2"
                onValueChange={(value) => {
                  setField("finalStatus", value === "final");
                  setField("enteredSurvey", value === "entered");
                }}
                value={values.finalStatus ? "final" : "entered"}
              >
                <ChoiceCard
                  description="Data from respondents to finished surveys, excluding abandons and screenouts."
                  id="final-status"
                  label="Final Status"
                  value="final"
                />
                <ChoiceCard
                  description="Data from all respondents who entered the survey."
                  id="entered-survey"
                  label="Entered Survey"
                  value="entered"
                />
              </RadioGroup>
            </fieldset>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="upload-url">
                Upload to URL
              </label>
              <Input
                aria-label="Upload to URL"
                id="upload-url"
                onChange={(event) => setField("uploadUrl", event.target.value)}
                placeholder="https://..."
                type="url"
                value={values.uploadUrl}
              />
              <p className="text-xs text-muted-foreground">
                Enter the location where the report should be uploaded to.
              </p>
              {errors.uploadUrl ? (
                <p className="text-sm text-rose-800" role="alert">
                  {errors.uploadUrl}
                </p>
              ) : null}
            </div>
            <label
              className="flex items-center gap-2 text-sm"
              htmlFor="partial-responses"
            >
              <Checkbox
                checked={values.includePartialResponses}
                id="partial-responses"
                onCheckedChange={(checked) =>
                  setField("includePartialResponses", checked === true)
                }
              />
              Include partial responses
            </label>
          </div>
        </details>
      ) : null}

      {values.reportType === "mini_router_quota" ? (
        <label
          className="flex items-center gap-2 text-sm"
          htmlFor="closed-quotas"
        >
          <Checkbox
            checked={values.includeClosedQuotas}
            id="closed-quotas"
            onCheckedChange={(checked) =>
              setField("includeClosedQuotas", checked === true)
            }
          />
          Include closed quotas
        </label>
      ) : null}

      <Separator />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={submitting || projects.length + subsamples.length === 0}
          type="submit"
        >
          {submitting ? "Creating Report…" : "Create Report"}
        </Button>
        <Button asChild type="button" variant="outline">
          <Link href="/reports">Cancel</Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          New reports are added to the queue.
        </span>
      </div>
    </form>
  );
}

function ChoiceCard({
  description,
  id,
  label,
  value,
}: {
  description: string;
  id: string;
  label: string;
  value: string;
}) {
  return (
    <label
      className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-checked:border-primary/50 has-checked:bg-primary/5"
      htmlFor={id}
    >
      <RadioGroupItem id={id} value={value} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}
