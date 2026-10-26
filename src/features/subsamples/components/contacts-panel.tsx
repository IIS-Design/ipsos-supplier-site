"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FieldError } from "@/components/ui/field-error";
import { ContactValues } from "@/features/contacts/components/contact-values";
import { ContactPicker } from "@/features/contacts/components/contact-picker";
import { contactSelectionsSchema, resolveContacts } from "@/features/contacts/contact-model";
import { saveContactsRequest } from "@/features/contacts/contact-request";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import type { Subsample } from "@/types/subsample";
import type { SupplierContacts } from "@/types/supplier";
const schema = z.object({ useDefaults: z.boolean(), selections: contactSelectionsSchema });
type Values = z.infer<typeof schema>;
export function ContactsPanel({ defaults, options, subsample, canEditDefaults = false }: { defaults: SupplierContacts; options: SupplierContacts; subsample: Subsample; canEditDefaults?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const setting = subsample.settingsOverrides?.contacts;
  const savedValues: Values = { useDefaults: setting?.mode !== "override", selections: setting?.mode === "override" ? setting.value : defaults.map(contact => contact.id) };
  const { control, setValue, handleSubmit, reset, formState: { isDirty, isSubmitting, errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: savedValues, values: savedValues, resetOptions: { keepDirtyValues: true } });
  const useDefaults = useWatch({ control, name: "useDefaults" });
  const selections = useWatch({ control, name: "selections" });
  useUnsavedChanges(isDirty, "You have unsaved contact changes. Leave this page and discard them?");
  const save = handleSubmit(async draft => {
    setError(""); setSuccess("");
    try {
      await saveContactsRequest(`/api/projects/${subsample.projectId}/subsamples/${subsample.id}/contacts`, draft.useDefaults ? { mode: "inherit" } : { mode: "override", value: draft.selections });
      reset(draft, { keepDirtyValues: false }); setSuccess(draft.useDefaults ? "Saved. This Subsample now inherits Default Contacts." : "Custom contacts saved. Supplier default changes will not change these selections."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save contacts."); }
  });
  return <section aria-labelledby="contacts-heading" className="max-w-4xl space-y-5"><div><h2 id="contacts-heading" className="text-lg font-semibold">Contacts</h2><p className="mt-1 text-muted-foreground">Use your supplier’s latest defaults or save independent contact selections for this Subsample.</p>{canEditDefaults && <Link className="mt-2 inline-block font-medium text-primary hover:underline" href="/settings/users#default-contacts-heading">Manage Default Contacts</Link>}</div>
    <form className="space-y-5" noValidate onSubmit={save} aria-busy={isSubmitting}>{error && <FieldError>{error}</FieldError>}{success && <p role="status" className="text-emerald-800">{success}</p>}
      <div className="flex flex-wrap items-center gap-3"><label htmlFor="use-default-contacts" className="font-medium">Use Default Contacts</label><Switch id="use-default-contacts" checked={useDefaults} disabled={isSubmitting} onCheckedChange={checked => { setValue("useDefaults", checked, { shouldDirty: true }); setSuccess(""); }} /><Badge variant="outline">{useDefaults ? "On · Inherited" : "Off · Custom"}</Badge></div>
      {useDefaults ? <ContactValues inherited contacts={resolveContacts(defaults, options, { mode: "inherit" })} /> : <><ContactPicker value={options.filter(contact => selections.includes(contact.id))} options={options} disabled={isSubmitting} onChange={next => { setValue("selections", next.map(contact => contact.id), { shouldDirty: true, shouldValidate: true }); setSuccess(""); }} /><p className="text-sm text-muted-foreground">Custom selections are independent. Selecting no contacts does not fall back to defaults.</p></>}
      {errors.selections && <FieldError>{errors.selections.message}</FieldError>}
      <div className="flex flex-wrap items-center gap-3 border-t pt-4"><Button disabled={!isDirty || isSubmitting} type="submit">{isSubmitting ? "Saving…" : "Save Contacts"}</Button><Button disabled={!isDirty || isSubmitting} type="button" variant="outline" onClick={() => { reset(savedValues, { keepDirtyValues: false }); setError(""); setSuccess(""); }}>Cancel</Button>{isDirty && <span role="status" className="text-muted-foreground">Unsaved changes</span>}</div>
    </form>
  </section>;
}
