"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formControlStyles } from "@/components/ui/form-control";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ContactValues } from "@/features/contacts/components/contact-values";
import {
  contactRoles,
  contactSelections,
  contactSelectionsSchema,
  resolveContacts,
} from "@/features/contacts/contact-model";
import { saveContactsRequest } from "@/features/contacts/contact-request";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import type { Subsample } from "@/types/subsample";
import type { SupplierContacts, SupplierContactRole } from "@/types/supplier";

const schema = z.object({
  useDefaults: z.boolean(),
  selections: contactSelectionsSchema,
});
type Values = z.infer<typeof schema>;

function initialValues(
  subsample: Subsample,
  defaults: SupplierContacts,
): Values {
  const setting = subsample.settingsOverrides?.contacts;
  return {
    useDefaults: setting?.mode !== "override",
    selections:
      setting?.mode === "override"
        ? contactSelections(setting.value)
        : {
            projectManager: defaults.projectManager.map(
              (contact) => contact.id,
            ),
            salesContact: defaults.salesContact.map((contact) => contact.id),
            financeContact: defaults.financeContact.map(
              (contact) => contact.id,
            ),
            helpDesk: defaults.helpDesk.map((contact) => contact.id),
          },
  };
}

export function ContactsPanel({
  defaults,
  options,
  subsample,
  canEditDefaults = false,
}: {
  defaults: SupplierContacts;
  options: SupplierContacts;
  subsample: Subsample;
  canEditDefaults?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searches, setSearches] = useState<
    Partial<Record<SupplierContactRole, string>>
  >({});
  const savedValues = initialValues(subsample, defaults);
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: savedValues,
    values: savedValues,
    resetOptions: { keepDirtyValues: true },
  });
  const values = useWatch({ control });
  const useDefaults = values.useDefaults ?? true;
  const selections = contactSelections(values.selections);
  useUnsavedChanges(isDirty);

  const save = handleSubmit(async (draft) => {
    setError(null);
    setSuccess(null);
    const setting = draft.useDefaults
      ? { mode: "inherit" as const }
      : { mode: "override" as const, value: draft.selections };
    try {
      await saveContactsRequest(
        `/api/projects/${subsample.projectId}/subsamples/${subsample.id}/contacts`,
        setting,
      );
      reset(draft, { keepDirtyValues: false });
      setSuccess(
        draft.useDefaults
          ? "Saved. This Subsample now inherits Organization Contacts."
          : "Custom contacts saved. Changes to organization defaults will not change these selections.",
      );
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save contacts.",
      );
    }
  });

  return (
    <section aria-labelledby="contacts-heading" className="max-w-4xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold" id="contacts-heading">
          Contacts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your organization’s latest defaults or save independent contact
          selections for this Subsample.
        </p>
        {canEditDefaults ? (
          <Link
            className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            href="/settings/users#organization-contacts-heading"
          >
            Manage Organization Contacts
          </Link>
        ) : null}
      </div>
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
        {success ? (
          <p
            className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
            role="status"
          >
            {success}
          </p>
        ) : null}
        <fieldset className="min-w-0 space-y-5" disabled={isSubmitting}>
          <legend className="sr-only">
            Subsample contact inheritance and selections
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className="text-sm font-medium"
              htmlFor="use-default-contacts"
            >
              Use Default Contacts
            </label>
            <Switch
              checked={useDefaults}
              disabled={isSubmitting}
              id="use-default-contacts"
              onCheckedChange={(checked) => {
                setValue("useDefaults", checked, { shouldDirty: true });
                setSuccess(null);
              }}
            />
            <Badge variant={useDefaults ? "secondary" : "outline"}>
              {useDefaults ? "On · Inherited" : "Off · Custom"}
            </Badge>
          </div>
          {useDefaults ? (
            <>
              <p className="text-sm text-muted-foreground">
                Inherited values are read-only here. Saving this mode replaces
                any saved custom selections with inheritance.
              </p>
              <ContactValues
                contacts={resolveContacts(defaults, options, {
                  mode: "inherit",
                })}
                inherited
              />
            </>
          ) : (
            <dl className="divide-y rounded-md border px-4">
              {contactRoles.map(({ key, label }) => {
                const selected = options[key].filter((contact) =>
                  selections[key].includes(contact.id),
                );
                const query = (searches[key] ?? "").trim().toLocaleLowerCase();
                const available = options[key].filter((contact) =>
                  `${contact.name} ${contact.email}`
                    .toLocaleLowerCase()
                    .includes(query),
                );
                return (
                  <div
                    className="grid gap-2 py-4 sm:grid-cols-[180px_minmax(0,1fr)]"
                    key={key}
                  >
                    <dt className="text-sm font-medium">{label}</dt>
                    <dd className="min-w-0 space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            aria-label={`Select ${label.toLowerCase()} contacts`}
                            className={`${formControlStyles} w-full justify-between font-normal`}
                            disabled={isSubmitting}
                            type="button"
                            variant="outline"
                          >
                            <span className="truncate">
                              {selected.length
                                ? selected
                                    .map((contact) => contact.name)
                                    .join(", ")
                                : "No custom contacts selected"}
                            </span>
                            <ChevronsUpDown
                              aria-hidden="true"
                              className="ml-2 size-4 shrink-0"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="max-h-80 overflow-y-auto p-2"
                        >
                          <Input
                            aria-label={`Search ${label.toLowerCase()} contacts`}
                            className="mb-2"
                            onChange={(event) =>
                              setSearches((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            placeholder="Search contacts…"
                            type="search"
                            value={searches[key] ?? ""}
                          />
                          {available.length ? (
                            available.map((contact) => (
                              <label
                                className="flex cursor-pointer items-start gap-2 rounded-sm p-2 text-sm hover:bg-accent focus-within:bg-accent focus-within:ring-1 focus-within:ring-ring"
                                htmlFor={`custom-${key}-${contact.id}`}
                                key={contact.id}
                              >
                                <Checkbox
                                  checked={selections[key].includes(contact.id)}
                                  disabled={isSubmitting}
                                  id={`custom-${key}-${contact.id}`}
                                  onCheckedChange={(checked) => {
                                    const next =
                                      checked === true
                                        ? [...selections[key], contact.id]
                                        : selections[key].filter(
                                            (id) => id !== contact.id,
                                          );
                                    setValue(`selections.${key}`, next, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                    setSuccess(null);
                                  }}
                                />
                                <span className="min-w-0">
                                  <span className="block wrap-break-word font-medium">
                                    {contact.name}
                                  </span>
                                  <span className="block wrap-break-word text-xs text-muted-foreground">
                                    {contact.email}
                                  </span>
                                </span>
                              </label>
                            ))
                          ) : (
                            <p className="p-2 text-sm text-muted-foreground">
                              {query
                                ? "No contacts match your search."
                                : "No organization contacts are available for this role. Ask your Administrator to add contacts."}
                            </p>
                          )}
                        </PopoverContent>
                      </Popover>
                      {selected.length ? (
                        selected.map((contact) => (
                          <p
                            className="wrap-break-word text-xs text-muted-foreground"
                            key={contact.id}
                          >
                            {contact.name} · {contact.email}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No contacts assigned. This role will not fall back to
                          organization defaults.
                        </p>
                      )}
                      {errors.selections?.[key]?.message ? (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.selections[key]?.message}
                        </p>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </fieldset>
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Button disabled={!isDirty || isSubmitting} type="submit">
            {isSubmitting ? "Saving Contacts…" : "Save Contacts"}
          </Button>
          <Button
            disabled={!isDirty || isSubmitting}
            onClick={() => {
              reset(savedValues, { keepDirtyValues: false });
              setError(null);
              setSuccess(null);
              setSearches({});
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <span className="text-sm text-muted-foreground" role="status">
            {isSubmitting
              ? "Saving contacts…"
              : isDirty
                ? "Unsaved changes"
                : "All changes saved"}
          </span>
        </div>
      </form>
    </section>
  );
}
