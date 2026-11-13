import { z } from "zod";

export const redirectFields = ["completes", "screenOuts", "quotaFull", "sniffOut", "longTerm", "suspicious", "platform", "security", "optOut"] as const;
export const endpointFields = ["complete", "termination", "quotaFull", "serverLoad", "sniffOut", "fraud", "optOut"] as const;
export const httpMethods = ["GET", "POST", "PUT", "PATCH"] as const;
export const redirectLabels: Record<typeof redirectFields[number], string> = {
  completes: "Complete (3, 98)", screenOuts: "Screenout (82)", quotaFull: "Quota Full (83)",
  sniffOut: "Sniff Out (81)", longTerm: "Long Session", suspicious: "Suspicious / Unengaged (99)",
  platform: "Incompatible Device (81 / 48)", security: "Security (81 / 47)", optOut: "Opt Out / Unsubscribe (100)",
};
export const endpointLabels: Record<typeof endpointFields[number], string> = {
  complete: "Complete (3, 98)", termination: "Screenout / Termination (82)", quotaFull: "Quota Full (83)",
  serverLoad: "Server Load (80)", sniffOut: "Sniff Out (81)", fraud: "Fraud / Suspicious (99)", optOut: "Opt Out / Unsubscribe (100)",
};
export const redirectNotes: Partial<Record<typeof redirectFields[number], string>> = {
  quotaFull: "If blank, uses the Screenout URL.", sniffOut: "If blank, uses the Screenout URL.",
  platform: "Status 81 · Substatus 48. If blank, uses Sniff Out, then Screenout.",
  security: "Status 81 · Substatus 47. If blank, uses Sniff Out, then Screenout.",
  longTerm: "Used when a live session exceeds its duration or page threshold. If blank, uses the Screenout URL.",
  optOut: "URL for respondents who opt out.",
};
export const endpointNotes: Partial<Record<typeof endpointFields[number], string>> = {
  complete: "Also covers payable completes with status 98.",
  sniffOut: "One endpoint covers all sniff-out reasons, including incompatible devices and security checks.",
};
export const integrationDescriptions = {
  redirects: "Send respondents back to your website when their session ends, with the outcome included in the URL.",
  "server-to-server": "Receive session outcomes directly on your server through background HTTP notifications, independently of the respondent’s redirect.",
};
export const redirectFallbackNote = "Specialized redirect URLs are optional. If no applicable URL is configured, the platform uses its default destination.";

/** Tokens are permitted in paths/query values, not in the URL scheme or host. No network calls. */
export const optionalIntegrationUrl = z.string().trim().max(2048, "Use 2048 characters or fewer.").refine(value => {
  if (!value) return true;
  if (/\s/.test(value) || !/^https?:\/\//i.test(value)) return false;
  const authority = value.replace(/^https?:\/\//i, "").split(/[/?#]/, 1)[0];
  if (/[<>%]/.test(authority)) return false;
  const normalized = value.replace(/<<[^<>]+>>|%%[^%]+%%/g, "token");
  if (/[<>]/.test(normalized)) return false;
  try {
    const url = new URL(normalized);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch { return false; }
}, "Enter a valid HTTP or HTTPS URL. Tokens must use <<name>> or %%NAME%% syntax.");
export const redirectValuesSchema = z.object(Object.fromEntries(redirectFields.map(key => [key, optionalIntegrationUrl])) as Record<typeof redirectFields[number], typeof optionalIntegrationUrl>).strict();
export const endpointValuesSchema = z.object(Object.fromEntries(endpointFields.map(key => [key, optionalIntegrationUrl])) as Record<typeof endpointFields[number], typeof optionalIntegrationUrl>).strict();
export const serverToServerValuesSchema = endpointValuesSchema.extend({ method: z.enum(httpMethods), pixel: z.string() }).strict();
export const redirectOverrideSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("inherit") }).strict(),
  z.object({ mode: z.literal("override"), value: redirectValuesSchema }).strict(),
]);
export const serverToServerOverrideSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("inherit") }).strict(),
  z.object({ mode: z.literal("override"), value: serverToServerValuesSchema }).strict(),
]);
export const linkConfigurationRequestSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("redirects"), setting: redirectOverrideSchema }).strict(),
  z.object({ section: z.literal("server-to-server"), setting: serverToServerOverrideSchema }).strict(),
]);
export type LinkConfigurationRequest = z.infer<typeof linkConfigurationRequestSchema>;
export type RedirectValues = z.infer<typeof redirectValuesSchema>;
export type ServerToServerValues = z.infer<typeof serverToServerValuesSchema>;
export const emptyRedirects = (): RedirectValues => Object.fromEntries(redirectFields.map(key => [key, ""])) as RedirectValues;
export const emptyEndpoints = () => Object.fromEntries(endpointFields.map(key => [key, ""])) as z.infer<typeof endpointValuesSchema>;
