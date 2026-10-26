"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { ContactPicker } from "@/features/contacts/components/contact-picker";
import { contactsSchema } from "@/features/contacts/contact-model";
import { saveContactsRequest } from "@/features/contacts/contact-request";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import type { SupplierContacts } from "@/types/supplier";
import type { User } from "@/types/user";
const schema = z.object({ contacts: contactsSchema });
type Values = z.infer<typeof schema>;
export function DefaultContacts({ contacts, users }: { contacts: SupplierContacts; users: User[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { control, setValue, handleSubmit, reset, formState: { isDirty, isSubmitting, errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { contacts }, values: { contacts }, resetOptions: { keepDirtyValues: true } });
  const selected = useWatch({ control, name: "contacts" });
  useUnsavedChanges(isDirty, "You have unsaved default contact changes. Leave and discard them?");
  const options = [...contacts, ...users.filter(user => (user.status ?? "active") === "active").map(user => ({ id: `user-${user.id}`, userId: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email }))];
  const save = handleSubmit(async values => {
    setError(""); setSuccess(false);
    try {
      const result = await saveContactsRequest<{ contacts: SupplierContacts }>("/api/settings/contacts", values.contacts);
      reset({ contacts: result.contacts }, { keepDirtyValues: false }); setSuccess(true); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save default contacts."); }
  });
  return <section aria-labelledby="default-contacts-heading" className="space-y-5"><div><h2 id="default-contacts-heading" className="text-xl font-semibold">Default Contacts</h2><p className="mt-2 text-muted-foreground">Emails included by default for supplier projects. Subsamples inherit these contacts unless custom contacts are saved.</p></div><form className="space-y-4" noValidate onSubmit={save} aria-busy={isSubmitting}>
    {error && <FieldError>{error}</FieldError>}{success && <p role="status" className="text-emerald-800">Default contacts saved.</p>}
    <ContactPicker value={selected} options={options} allowEmail disabled={isSubmitting} onChange={next => { setValue("contacts", next, { shouldDirty: true, shouldValidate: true }); setSuccess(false); }} />
    {errors.contacts && <FieldError>Check your contacts. Each email must be valid and selected only once.</FieldError>}
    <div className="flex flex-wrap items-center gap-3"><Button disabled={!isDirty || isSubmitting} type="submit">{isSubmitting ? "Saving…" : "Save Defaults"}</Button><Button type="button" variant="outline" disabled={!isDirty || isSubmitting} onClick={() => { reset({ contacts }, { keepDirtyValues: false }); setError(""); setSuccess(false); }}>Cancel</Button>{isDirty && <span className="text-muted-foreground" role="status">Unsaved changes</span>}</div>
  </form></section>;
}
