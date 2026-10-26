"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactValues } from "@/features/contacts/components/contact-values";
import {
  contactRoles,
  contactsSchema,
} from "@/features/contacts/contact-model";
import { saveContactsRequest } from "@/features/contacts/contact-request";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import type { SupplierContactRole, SupplierContacts } from "@/types/supplier";

const formSchema = z.object({ contacts: contactsSchema });
type Values = z.infer<typeof formSchema>;

export function OrganizationContacts({
  contacts,
  supplierName,
  embedded = false,
}: {
  contacts: SupplierContacts;
  supplierName: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: { contacts },
    values: { contacts },
    resetOptions: { keepDirtyValues: true },
  });
  const currentContacts = useWatch({ control, name: "contacts" });
  useUnsavedChanges(editing && isDirty);

  const save = handleSubmit(async (values) => {
    setError(null);
    setSuccess(false);
    try {
      const result = await saveContactsRequest<{ contacts: SupplierContacts }>(
        "/api/settings/contacts",
        values.contacts,
      );
      reset({ contacts: result.contacts }, { keepDirtyValues: false });
      setEditing(false);
      setSuccess(true);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save contact defaults.",
      );
    }
  });

  return (
    <section
      aria-labelledby="organization-contacts-heading"
      className="max-w-4xl space-y-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {!embedded && <p className="text-sm text-muted-foreground">Settings · {supplierName}</p>}
          {embedded ? <h2 className="text-xl font-semibold" id="organization-contacts-heading">Organization Contacts</h2> : <h1 className="mt-1 text-2xl font-semibold tracking-tight" id="organization-contacts-heading">Organization Contacts</h1>}
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Default contacts for your organization. Subsamples using defaults
            inherit saved changes. Custom Subsample selections are not changed.
          </p>
        </div>
        {!editing ? (
          <Button
            onClick={() => {
              setEditing(true);
              setSuccess(false);
              setError(null);
            }}
            type="button"
          >
            Edit Defaults
          </Button>
        ) : null}
      </header>
      {success ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
          role="status"
        >
          Contact defaults saved. Subsamples using defaults will inherit these
          values when loaded.
        </p>
      ) : null}
      {!editing ? (
        <ContactValues contacts={currentContacts} />
      ) : (
        <form
          aria-busy={isSubmitting}
          className="space-y-5"
          noValidate
          onSubmit={save}
        >
          {error ? (
            <p
              className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <fieldset className="space-y-5" disabled={isSubmitting}>
            <legend className="sr-only">
              Edit organization contact defaults
            </legend>
            {contactRoles.map(({ key, label }) => (
              <RoleFields
                control={control}
                errors={errors}
                key={key}
                label={label}
                register={register}
                role={key}
              />
            ))}
          </fieldset>
          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <Button disabled={!isDirty || isSubmitting} type="submit">
              {isSubmitting ? "Saving Defaults…" : "Save Defaults"}
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => {
                reset({ contacts }, { keepDirtyValues: false });
                setEditing(false);
                setError(null);
                setSuccess(false);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <span className="text-sm text-muted-foreground" role="status">
              {isSubmitting
                ? "Saving contact defaults…"
                : isDirty
                  ? "Unsaved changes"
                  : "No unsaved changes"}
            </span>
          </div>
        </form>
      )}
    </section>
  );
}

function RoleFields({
  role,
  label,
  control,
  register,
  errors,
}: {
  role: SupplierContactRole;
  label: string;
  control: Control<Values>;
  register: UseFormRegister<Values>;
  errors: FieldErrors<Values>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `contacts.${role}`,
    keyName: "rowKey",
  });
  return (
    <fieldset className="min-w-0 rounded-md border p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="space-y-4">
        {!fields.length ? (
          <p className="text-sm text-muted-foreground">
            No defaults for this role. Subsamples using defaults will show no
            contacts.
          </p>
        ) : null}
        {fields.map((field, index) => {
          const nameError = errors.contacts?.[role]?.[index]?.name?.message;
          const emailError = errors.contacts?.[role]?.[index]?.email?.message;
          const prefix = `${role}-${index}`;
          return (
            <div
              className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
              key={field.rowKey}
            >
              <input
                type="hidden"
                {...register(`contacts.${role}.${index}.id`)}
              />
              <div className="space-y-1">
                <label className="text-sm" htmlFor={`${prefix}-name`}>
                  Name
                </label>
                <Input
                  {...register(`contacts.${role}.${index}.name`)}
                  aria-describedby={
                    nameError ? `${prefix}-name-error` : undefined
                  }
                  aria-invalid={Boolean(nameError)}
                  autoComplete="name"
                  id={`${prefix}-name`}
                  maxLength={120}
                />
                {nameError ? (
                  <p
                    className="text-sm text-destructive"
                    id={`${prefix}-name-error`}
                    role="alert"
                  >
                    {nameError}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label className="text-sm" htmlFor={`${prefix}-email`}>
                  Email Address
                </label>
                <Input
                  {...register(`contacts.${role}.${index}.email`)}
                  aria-describedby={
                    emailError ? `${prefix}-email-error` : undefined
                  }
                  aria-invalid={Boolean(emailError)}
                  autoComplete="email"
                  id={`${prefix}-email`}
                  maxLength={254}
                  type="email"
                />
                {emailError ? (
                  <p
                    className="text-sm text-destructive"
                    id={`${prefix}-email-error`}
                    role="alert"
                  >
                    {emailError}
                  </p>
                ) : null}
              </div>
              <Button
                aria-label={`Remove ${label} ${index + 1}`}
                className="sm:mt-6"
                onClick={() => remove(index)}
                type="button"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                <span className="sm:sr-only">Remove</span>
              </Button>
            </div>
          );
        })}
        <Button
          disabled={fields.length >= 20}
          onClick={() =>
            append({ id: `draft-${crypto.randomUUID()}`, name: "", email: "" })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add {label}
        </Button>
      </div>
    </fieldset>
  );
}
