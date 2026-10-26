import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const emailTemplates = [
  "reset-password",
  "user-invitation",
  "password-changed",
  "account-created",
] as const;
export type EmailTemplate = (typeof emailTemplates)[number];

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

/** Templates contain trusted markup; every substituted value is escaped once. */
export async function renderEmailTemplate(
  template: EmailTemplate,
  values: Record<string, string>,
) {
  if (!emailTemplates.includes(template)) throw new Error("Unknown email template.");
  for (const key of ["action_url", "logo_url"]) {
    const url = new URL(values[key]);
    if (url.protocol !== "https:" && url.protocol !== "http:")
      throw new Error("Email links must use HTTP or HTTPS.");
  }
  const source = await readFile(path.join(process.cwd(), "public", "emails", `${template}.html`), "utf8");
  return source.replace(/\{\{([a-z_]+)\}\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing email value: ${key}`);
    return escapeHtml(values[key]);
  });
}
