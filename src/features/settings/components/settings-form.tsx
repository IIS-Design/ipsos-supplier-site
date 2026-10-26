"use client";

import { withBasePath } from "@/lib/app-path";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, timeZones, requiredFields, redirectFields, endpointFields, fieldLabels, type SettingsValues, type EditableSettingsSection } from "@/features/settings/settings-model";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError as SharedFieldError } from "@/components/ui/field-error";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";

function FieldError({ message, id }: { message?: string; id?: string }) { return message ? <SharedFieldError id={id}>{message}</SharedFieldError> : null; }

export function SettingsForm({ section, initialValues }: { section: EditableSettingsSection; initialValues: SettingsValues }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const { register, handleSubmit, reset, control, setValue, getFieldState, formState: { isDirty, isSubmitting, errors } } = useForm<SettingsValues>({ resolver: zodResolver(settingsSchema), defaultValues: initialValues });
  useUnsavedChanges(isDirty, "You have unsaved settings changes. Leave this page and discard them?");
  const required = useWatch({ control, name: "survey-configuration.requiredFields" });
  const routing = useWatch({ control, name: "server-to-server.routing" });
  const timeZone = useWatch({ control, name: "organization.timeZone" });
  const combination = useWatch({ control, name: "server-to-server.combination" });
  const save = handleSubmit(async values => {
    setError(""); setSuccess(false);
    try {
      const response = await fetch(withBasePath("/api/settings/preferences/"), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, values }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Settings could not be saved.");
      reset(result.values); setSuccess(true); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to connect to the service."); }
  });
  function textField(path: FieldPath<SettingsValues>, label: string, placeholder?: string) {
    const fieldError = getFieldState(path).error?.message;
    return <div key={path} className="space-y-1.5"><label htmlFor={path}>{label}</label><Input {...register(path)} id={path} placeholder={placeholder} aria-invalid={!!fieldError} aria-describedby={fieldError ? `${path}-error` : undefined} /><FieldError id={`${path}-error`} message={fieldError} /></div>;
  }
  return <form onSubmit={save} noValidate aria-busy={isSubmitting} className="space-y-6">
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {success && <p role="status" className="text-emerald-800">Settings saved successfully.</p>}
    <fieldset disabled={isSubmitting} className="space-y-6">
      <legend className="sr-only">Edit supplier settings</legend>
      {section === "organization" && <>
        {textField("organization.companyName", "Company Name")}
        <div className="space-y-1.5"><label htmlFor="organization-time-zone">Time Zone</label><Select value={timeZone} onValueChange={value => setValue("organization.timeZone", value as SettingsValues["organization"]["timeZone"], { shouldDirty: true })}><SelectTrigger id="organization-time-zone"><SelectValue /></SelectTrigger><SelectContent>{timeZones.map(zone => <SelectItem key={zone} value={zone}>{zone.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
      </>}
      {section === "survey-configuration" && <section className="space-y-4"><div><h2 className="text-lg font-medium">Required Survey Information</h2><p className="mt-1 text-muted-foreground">Select the fields that must be provided when a survey is configured.</p></div><div className="space-y-2">{requiredFields.map(key => <label key={key} className={`flex min-h-11 items-center gap-3 rounded-md border p-3 ${required.includes(key) ? "border-primary/30 bg-primary/5" : ""}`}><Checkbox checked={required.includes(key)} onCheckedChange={checked => setValue("survey-configuration.requiredFields", checked ? [...required, key] : required.filter(item => item !== key), { shouldDirty: true })} />{fieldLabels[key]}</label>)}</div></section>}
      {section === "redirects" && <>
        <section className="space-y-4"><h2 className="text-lg font-medium">Survey Outcomes</h2>{redirectFields.slice(0, 4).map(key => textField(`redirects.${key}`, fieldLabels[key], "https://…"))}</section>
        <section className="space-y-4"><h2 className="text-lg font-medium">Other Outcomes</h2>{redirectFields.slice(4).map(key => textField(`redirects.${key}`, fieldLabels[key], "https://…"))}</section>
      </>}
      {section === "server-to-server" && <>
        <section className="space-y-4"><h2 className="text-lg font-medium">Endpoints</h2>{endpointFields.map(key => textField(`server-to-server.endpoints.${key}`, key === "quotaFull" ? "Quota Full" : fieldLabels[key], "https://…"))}</section>
        <section className="space-y-4"><div><h2 className="text-lg font-medium">Routing</h2><p className="mt-1 text-muted-foreground">Choose what happens when a respondent can be routed again.</p></div>
          <RadioGroup value={routing} onValueChange={value => setValue("server-to-server.routing", value as SettingsValues["server-to-server"]["routing"], { shouldDirty: true })} aria-label="Routing behavior">
            {([ ["available", "Keep trying while routing is available"], ["defaults", "Use router defaults"], ["custom", "Custom Limits"], ["none", "Do not reroute"] ] as const).map(([value, label]) => <div key={value} className={`rounded-md border p-3 ${routing === value ? "border-primary/30 bg-primary/5" : ""}`}><label className="flex items-center gap-3"><RadioGroupItem value={value} />{label}</label>{value === "defaults" && <p className="mt-2 pl-7 text-sm text-muted-foreground">Up to 15 minutes and 4 attempts.</p>}{value === "custom" && <div className="mt-2 flex flex-wrap items-center gap-2 pl-7 text-sm"><span>Up to</span><Input aria-label="Routing minutes" type="number" min={1} max={1440} className="w-20" disabled={routing !== "custom"} {...register("server-to-server.minutes", { valueAsNumber: true })} /><span>minutes</span><Select disabled={routing !== "custom"} value={combination} onValueChange={value => setValue("server-to-server.combination", value as "and" | "or", { shouldDirty: true })}><SelectTrigger aria-label="Combine routing limits" className="w-20"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="and">and</SelectItem><SelectItem value="or">or</SelectItem></SelectContent></Select><Input aria-label="Routing attempts" type="number" min={1} max={100} className="w-20" disabled={routing !== "custom"} {...register("server-to-server.attempts", { valueAsNumber: true })} /><span>attempts.</span></div>}</div>)}
          </RadioGroup>
          <FieldError message={errors["server-to-server"]?.minutes?.message} /><FieldError message={errors["server-to-server"]?.attempts?.message} />
        </section>
      </>}
      {section === "security" && <section className="space-y-6"><div><h2 className="text-lg font-medium">Integration Credentials</h2><p className="mt-1 text-muted-foreground">Credentials used to authenticate your organization.</p></div>{textField("security.sourceKey", "Source Key")}<p className="text-muted-foreground">Identifier used to authenticate your organization.</p><div className="space-y-2"><label htmlFor="settings-secret">Secret Key</label><PasswordInput {...register("security.secretKey")} id="settings-secret" visibilityLabel="secret key" aria-invalid={!!errors.security?.secretKey} /><FieldError message={errors.security?.secretKey?.message} /><div className="flex flex-wrap items-start justify-between gap-3"><p className="max-w-sm text-muted-foreground">Keep this key secure. Anyone with access to it may be able to authenticate requests on behalf of your organization.</p><Button type="button" variant="outline" onClick={() => setRegenerate(true)}>Regenerate Secret Key</Button></div></div></section>}
    </fieldset>
    <div className="flex flex-wrap items-center gap-3"><Button disabled={!isDirty || isSubmitting} type="submit">{isSubmitting ? "Saving…" : "Save Changes"}</Button><Button disabled={!isDirty || isSubmitting} type="button" variant="outline" onClick={() => { reset(); setError(""); setSuccess(false); }}>Cancel</Button>{isDirty && <span className="text-muted-foreground" role="status">Unsaved changes</span>}</div>
    <AlertDialog open={regenerate} onOpenChange={setRegenerate}><AlertDialogContent><AlertDialogTitle>Regenerate Secret Key?</AlertDialogTitle><AlertDialogDescription>The new key will replace the previous key when you save changes.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><Button type="button" onClick={() => { setValue("security.secretKey", `demo-${crypto.randomUUID()}`, { shouldDirty: true, shouldValidate: true }); setRegenerate(false); setSuccess(false); }}>Regenerate</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </form>;
}
