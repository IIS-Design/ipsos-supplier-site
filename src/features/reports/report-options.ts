import { z } from "zod";

export const statusOptions = [["1", "In router"], ["2", "In survey"], ["3", "Complete"], ["81", "Sniff out"], ["82", "Screen out"], ["83", "Quota full"], ["91", "Abandon (in router)"], ["92", "Abandon (in survey)"]] as const;
// Reference examples from the supplied MIR guide; not a complete production catalogue.
export const substatusOptions = [["7", "Blacklisted User"], ["9", "IPCountry"], ["21", "Regular (quota full)"], ["23", "Quota by supplier full"], ["47", "Security Profile"], ["48", "NonCompatibleDevice"], ["50", "Quota Logic"], ["51", "Routed"], ["85", "DuplicateRespondentDifferentSupplier"], ["104", "Facial Coding pending"], ["105", "Facial Coding validated"], ["106", "PrivacyOptOut"], ["107", "Facial Coding invalid"], ["108", "TamperedLink"], ["111", "iOvation failed evaluation"], ["112", "iOvation evaluation call failed"], ["115", "QuotaFull (in-survey counts)"], ["118", "NewRecruitCapReached"], ["121", "TrapError"], ["122", "FailedTrap"]] as const;
export const reportScopeSchema = z.discriminatedUnion("scopeType", [
  z.object({ scopeType: z.literal("project"), projectId: z.string().min(1) }).strict(),
  z.object({ scopeType: z.literal("subsample"), subsampleId: z.string().min(1) }).strict(),
  z.object({ scopeType: z.literal("subsamples"), subsampleIds: z.array(z.string().min(1)).min(1).max(10).refine(ids => new Set(ids).size === ids.length, "Duplicate subsample IDs.") }).strict(),
  z.object({ scopeType: z.literal("supplier") }).strict(),
]);
export function dateInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function dateBounds(timeZone: string, now = new Date()) {
  const today = dateInZone(now, timeZone);
  const base = new Date(`${today}T12:00:00Z`);
  const start = new Date(base); start.setUTCDate(start.getUTCDate() - 14);
  const min = new Date(base); min.setUTCDate(1); min.setUTCMonth(min.getUTCMonth() - 3);
  min.setUTCDate(Math.min(base.getUTCDate(), new Date(Date.UTC(min.getUTCFullYear(), min.getUTCMonth() + 1, 0)).getUTCDate()));
  return { from: start.toISOString().slice(0, 10), to: today, min: min.toISOString().slice(0, 10) };
}
/** Resolve local midnight using IANA offsets, including DST; no browser-zone dependency. */
export function zonedDayStart(day: string, timeZone: string) {
  const target = Date.parse(`${day}T00:00:00Z`);
  let instant = target;
  const formatter = new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  for (let i = 0; i < 5; i++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p => [p.type, p.value]));
    const represented = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    const delta = target - represented;
    if (!delta) break;
    instant += delta;
  }
  return new Date(instant).toISOString();
}
export function zonedDayEnd(day: string, timeZone: string) {
  const next = new Date(`${day}T12:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
  return new Date(Date.parse(zonedDayStart(next.toISOString().slice(0, 10), timeZone)) - 1).toISOString();
}
export function zoneLabel(timeZone: string, day: string) {
  const name = timeZone.split("/").at(-1)!.replaceAll("_", " ");
  const offset = new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "longOffset" }).formatToParts(new Date(zonedDayStart(day, timeZone))).find(p => p.type === "timeZoneName")?.value.replace("GMT", "UTC").replace("-", "−") ?? "UTC";
  return `${name} (${offset === "UTC" ? "UTC+00:00" : offset})`;
}
export const createReportSchema = z.object({
  type: z.literal("respondent_info"), scope: reportScopeSchema,
  dateFrom: z.iso.datetime(), dateTo: z.iso.datetime(), timeZone: z.string(),
  respondentStatus: z.array(z.string()).default([]), respondentSubstatus: z.array(z.string()).default([]),
  linkType: z.enum(["live_users", "proofing_users", "both"]), reportType: z.enum(["final_status", "entered_survey"]), deduplicateSessions: z.boolean().default(false),
}).strict().superRefine((value, ctx) => {
  try { new Intl.DateTimeFormat("en", { timeZone: value.timeZone }).format(); } catch { ctx.addIssue({ code: "custom", path: ["timeZone"], message: "Invalid time zone." }); return; }
  if (!Number.isFinite(Date.parse(value.dateFrom)) || !Number.isFinite(Date.parse(value.dateTo))) return;
  const bounds = dateBounds(value.timeZone);
  if (dateInZone(new Date(value.dateFrom), value.timeZone) < bounds.min) ctx.addIssue({ code: "custom", path: ["dateFrom"], message: "Start date must be within the last three months." });
  if (value.dateFrom > value.dateTo) ctx.addIssue({ code: "custom", path: ["dateTo"], message: "Start date must be on or before end date." });
  for (const [key, options] of [["respondentStatus", statusOptions], ["respondentSubstatus", substatusOptions]] as const) if (value[key].some(code => !options.some(([id]) => id === code))) ctx.addIssue({ code: "custom", path: [key], message: "Unknown status code." });
});
