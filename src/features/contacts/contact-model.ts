import { z } from "zod";
import type { SettingOverride } from "@/types/scopes";
import type { SubsampleContactOverrides } from "@/types/subsample";
import type { SupplierContactRole, SupplierContacts } from "@/types/supplier";

export const contactRoles: { key: SupplierContactRole; label: string }[] = [
  { key: "projectManager", label: "Project Manager" },
  { key: "salesContact", label: "Sales Contact" },
  { key: "financeContact", label: "Finance Contact" },
  { key: "helpDesk", label: "Help Desk Contact" },
];

export const emptyContacts = (): SupplierContacts => ({
  projectManager: [],
  salesContact: [],
  financeContact: [],
  helpDesk: [],
});

const contactSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1, "Enter a contact name.").max(120),
    email: z.string().trim().max(254).email("Enter a valid email address."),
  })
  .strict();

const contactListSchema = z
  .array(contactSchema)
  .max(20)
  .superRefine((contacts, ctx) => {
    const emails = new Set<string>();
    contacts.forEach((contact, index) => {
      const email = contact.email.toLowerCase();
      if (emails.has(email))
        ctx.addIssue({
          code: "custom",
          message: "This email is already assigned to this role.",
          path: [index, "email"],
        });
      emails.add(email);
    });
  });

export const contactsSchema = z
  .object({
    projectManager: contactListSchema,
    salesContact: contactListSchema,
    financeContact: contactListSchema,
    helpDesk: contactListSchema,
  })
  .strict();

const selectedIds = z
  .array(z.string().min(1).max(100))
  .max(20)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "Select each contact only once.",
  );

export const contactSelectionsSchema = z
  .object({
    projectManager: selectedIds,
    salesContact: selectedIds,
    financeContact: selectedIds,
    helpDesk: selectedIds,
  })
  .strict();

export const contactOverrideSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("inherit") }).strict(),
  z
    .object({ mode: z.literal("override"), value: contactSelectionsSchema })
    .strict(),
]);

export function contactSelections(value?: SubsampleContactOverrides) {
  return {
    projectManager: value?.projectManager ?? [],
    salesContact: value?.salesContact ?? [],
    financeContact: value?.financeContact ?? [],
    helpDesk: value?.helpDesk ?? [],
  };
}

export function resolveContacts(
  defaults: SupplierContacts,
  options: SupplierContacts,
  setting?: SettingOverride<SubsampleContactOverrides>,
): SupplierContacts {
  if (!setting || setting.mode === "inherit") return defaults;
  const resolved = emptyContacts();
  for (const { key } of contactRoles) {
    resolved[key] = options[key].filter((contact) =>
      setting.value[key]?.includes(contact.id),
    );
  }
  return resolved;
}
