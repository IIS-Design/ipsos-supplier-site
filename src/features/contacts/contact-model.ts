import { z } from "zod";
import type { SettingOverride } from "@/types/scopes";
import type { SubsampleContactOverrides } from "@/types/subsample";
import type { SupplierContacts } from "@/types/supplier";

export const emptyContacts = (): SupplierContacts => [];
export const contactEmailSchema = z.string().trim().toLowerCase().max(254).email("Enter a valid email address.");
const contactSchema = z.object({
  id: z.string().min(1).max(100), name: z.string().trim().max(200), email: contactEmailSchema,
  userId: z.string().min(1).max(100).optional(),
}).strict();
export const contactsSchema = z.array(contactSchema).max(80, "Select up to 80 contacts.").superRefine((contacts, ctx) => {
  const emails = new Set<string>();
  contacts.forEach((contact, index) => {
    if (emails.has(contact.email)) ctx.addIssue({ code: "custom", message: "Select each email address only once.", path: [index, "email"] });
    emails.add(contact.email);
  });
});
export const contactSelectionsSchema = z.array(z.string().min(1).max(100)).max(80).refine(ids => new Set(ids).size === ids.length, "Select each contact only once.");
export const contactOverrideSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("inherit") }).strict(),
  z.object({ mode: z.literal("override"), value: contactSelectionsSchema }).strict(),
]);

/** Read old process-local role groups without losing saved contact identities. */
export function migrateContacts(value: unknown): SupplierContacts {
  if (!value) return [];
  const entries = Array.isArray(value) ? value : Object.values(value as Record<string, unknown[]>).flat();
  return Array.from(new Map((entries as SupplierContacts).map(contact => [contact.id, contact])).values());
}
export function contactSelections(value?: SubsampleContactOverrides | Record<string, string[]>): string[] {
  return [...new Set(Array.isArray(value) ? value : Object.values(value ?? {}).flat())];
}
export function resolveContacts(defaults: SupplierContacts, options: SupplierContacts, setting?: SettingOverride<SubsampleContactOverrides>): SupplierContacts {
  if (!setting || setting.mode === "inherit") return defaults;
  return options.filter(contact => setting.value.includes(contact.id));
}
