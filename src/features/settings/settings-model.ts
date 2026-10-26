import { z } from "zod";
import { accountSchema } from "@/features/account/account-model";

export const settingsSections = ["organization", "users", "survey-configuration", "redirects", "server-to-server", "security"] as const;
export type SettingsSection = typeof settingsSections[number];
export const settingsLabels: Record<SettingsSection, string> = {
  organization: "Organization", users: "Users & Permissions", "survey-configuration": "Survey Configuration",
  redirects: "Respondent Redirects", "server-to-server": "Server-to-Server", security: "Security",
};
export const requiredFields = ["projectManager", "salesContact", "financeContact", "helpDeskEmail", "projectId"] as const;
export const redirectFields = ["completes", "screenOuts", "quotaFull", "sniffOut", "longTerm", "suspicious", "platform", "security"] as const;
export const endpointFields = ["complete", "termination", "quotaFull", "serverLoad", "sniffOut", "fraud", "optOut"] as const;
export const fieldLabels: Record<string, string> = {
  projectManager: "Project Manager", salesContact: "Sales Contact", financeContact: "Finance Contact", helpDeskEmail: "Help Desk Email", projectId: "Project ID",
  completes: "Completes", screenOuts: "Screen Outs", quotaFull: "Quota Full / Survey Closed", sniffOut: "Sniff Out", longTerm: "Long Term Redirect", suspicious: "Suspicious / Unengaged", platform: "Platform (mobile or not) Redirect", security: "Security Redirect",
  complete: "Complete", termination: "Termination", serverLoad: "Server Load", fraud: "Fraud", optOut: "Opt Out",
};
const optionalUrl = z.string().trim().max(2048, "Use 2048 characters or fewer.").refine(value => {
  if (!value) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Enter a valid HTTP or HTTPS URL.");
export const timeZones = ["UTC", "America/Los_Angeles", "America/New_York", "America/Argentina/Buenos_Aires", "Europe/London", "Europe/Paris", "Europe/Bucharest", "Asia/Tokyo", "Australia/Sydney"] as const;
export const settingsSchema = z.object({
  organization: z.object({ companyName: z.string().trim().min(1, "Enter your company name.").max(200), timeZone: z.enum(timeZones) }).strict(),
  "survey-configuration": z.object({ requiredFields: z.array(z.enum(requiredFields)).max(5).refine(items => new Set(items).size === items.length) }).strict(),
  redirects: z.object(Object.fromEntries(redirectFields.map(key => [key, optionalUrl])) as Record<typeof redirectFields[number], typeof optionalUrl>).strict(),
  "server-to-server": z.object({
    endpoints: z.object(Object.fromEntries(endpointFields.map(key => [key, optionalUrl])) as Record<typeof endpointFields[number], typeof optionalUrl>).strict(),
    routing: z.enum(["available", "defaults", "custom", "none"]), minutes: z.number().int().min(1).max(1440), attempts: z.number().int().min(1).max(100), combination: z.enum(["and", "or"]),
  }).strict(),
  security: z.object({ sourceKey: z.string().trim().min(1, "Enter a source key.").max(100), secretKey: z.string().min(12, "Use at least 12 characters.").max(200) }).strict(),
}).strict();
export type SettingsValues = z.infer<typeof settingsSchema>;
export type EditableSettingsSection = keyof SettingsValues;
export const preferencesRequestSchema = z.object({ section: z.enum(["organization", "survey-configuration", "redirects", "server-to-server", "security"]), values: settingsSchema }).strict();
export function defaultSettings(companyName: string): SettingsValues {
  return {
    organization: { companyName, timeZone: "UTC" },
    "survey-configuration": { requiredFields: ["projectManager", "salesContact"] },
    redirects: Object.fromEntries(redirectFields.map(key => [key, ""])) as SettingsValues["redirects"],
    "server-to-server": { endpoints: Object.fromEntries(endpointFields.map(key => [key, ""])) as SettingsValues["server-to-server"]["endpoints"], routing: "defaults", minutes: 15, attempts: 4, combination: "and" },
    security: { sourceKey: "SUPPLIER-DEMO", secretKey: "demo-integration-secret-not-live" },
  };
}
export const managedProfileSchema = accountSchema.extend({ role: z.enum(["admin", "user"]) }).strict();
export const userManagementSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("invite"), profile: managedProfileSchema }).strict(),
  z.object({ action: z.literal("edit"), userId: z.string().min(1), profile: managedProfileSchema }).strict(),
  z.object({ action: z.enum(["deactivate", "activate", "reset-password"]), userId: z.string().min(1) }).strict(),
]);
export type UserManagementRequest = z.infer<typeof userManagementSchema>;
