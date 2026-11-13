"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import { withBasePath } from "@/lib/app-path";
import {
  redirectFields, endpointFields, redirectLabels, endpointLabels, redirectNotes, endpointNotes,
  httpMethods, linkConfigurationRequestSchema, type LinkConfigurationRequest,
} from "@/features/settings/integration-model";
import { IntegrationIntro } from "@/features/settings/components/integration-help";
import { useConfigurationState, type ConfigKey, type ConfigurationSectionState } from "./configuration-state";

export function LinkConfigurationForm({ section, projectId, subsampleId, initial, preview }: {
  section: ConfigKey; projectId: string; subsampleId: string; initial: ConfigurationSectionState; preview: boolean;
}) {
  const router = useRouter();
  const config = useConfigurationState();
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>(() => {
    if (!preview || initial.inherited) return {};
    const parsed = linkConfigurationRequestSchema.safeParse({ section, setting: { mode: "override", value: initial.values } });
    return parsed.success ? {} : Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path.at(-1)), issue.message]));
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const baseline = config.sections[section];
  const dirty = !preview && (draft.inherited !== baseline.inherited || (!draft.inherited && JSON.stringify(draft.values) !== JSON.stringify(baseline.values)));
  useUnsavedChanges(dirty, "You have unsaved configuration changes. Leave this page and discard them?");
  const values = draft.inherited ? config.defaults[section] : draft.values;
  function edit(field: string, value: string) {
    setDraft(current => ({ ...current, values: { ...current.values, [field]: value } }));
    setErrors(current => ({ ...current, [field]: "" }));
    setSuccess(false); setMessage("");
  }
  function focusFirstError() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || saving) return;
    setErrors({}); setMessage(""); setSuccess(false);
    const parsed = linkConfigurationRequestSchema.safeParse({ section, setting: draft.inherited ? { mode: "inherit" } : { mode: "override", value: draft.values } });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path.at(-1)), issue.message])));
      focusFirstError(); return;
    }
    setSaving(true);
    try {
      const response = await fetch(withBasePath(`/api/projects/${projectId}/subsamples/${subsampleId}/links/`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) setErrors(Object.fromEntries(result.errors.map((issue: { path: string; message: string }) => [issue.path.split(".").at(-1), issue.message])));
        setMessage(result.message ?? "Configuration could not be saved. Please try again.");
        focusFirstError(); return;
      }
      const saved = { section, setting: result.setting } as LinkConfigurationRequest;
      config.commit(saved);
      setDraft({ inherited: saved.setting.mode === "inherit", values: saved.setting.mode === "override" ? { ...saved.setting.value } : { ...config.defaults[section] } });
      setSuccess(true); router.refresh();
    } catch { setMessage("Unable to connect to the service. Your changes are still available. Please try again."); }
    finally { setSaving(false); }
  }
  function cancel() {
    setDraft({ inherited: baseline.inherited, values: { ...baseline.values } });
    setErrors({}); setMessage(""); setSuccess(false);
  }
  const fields = section === "redirects"
    ? redirectFields.map(field => ({ field, label: redirectLabels[field], note: redirectNotes[field] }))
    : endpointFields.map(field => ({ field, label: endpointLabels[field], note: endpointNotes[field] }));
  return (
    <form ref={formRef} onSubmit={save} noValidate className="space-y-5" aria-busy={saving}>
      <IntegrationIntro section={section} />
      <fieldset disabled={saving} className="space-y-5">
        <legend className="sr-only">{section === "redirects" ? "Redirect configuration" : "Server-to-server configuration"}</legend>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium" htmlFor={`inherit-${section}`}>Use Supplier Defaults</label>
          <Switch id={`inherit-${section}`} checked={draft.inherited} onCheckedChange={inherited => { setDraft(current => ({ ...current, inherited })); setErrors({}); setSuccess(false); setMessage(""); }} />
          <Badge variant="outline">{draft.inherited ? "Inherited" : "Custom Override"}</Badge>
        </div>
        {!draft.inherited && <p className="text-xs text-muted-foreground">Custom settings apply to this section only. Blank fields do not inherit individual supplier URLs.</p>}
        {section === "server-to-server" && <>
          <div className="space-y-1.5">
            <label htmlFor="s2s-method" className="text-sm font-medium">HTTP Method</label>
            <Select value={values.method || "POST"} disabled={draft.inherited} onValueChange={method => edit("method", method)}>
              <SelectTrigger id="s2s-method" className="w-full sm:w-48" aria-invalid={Boolean(errors.method)} aria-describedby="s2s-method-note"><SelectValue /></SelectTrigger>
              <SelectContent>{httpMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent>
            </Select>
            <p id="s2s-method-note" className="text-xs text-muted-foreground">Method used to send notifications to your server.</p>
            {errors.method && <p role="alert" className="text-sm text-rose-800">{errors.method}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="s2s-pixel" className="text-sm font-medium">Pixel HTML</label>
            <textarea id="s2s-pixel" className="min-h-24 w-full rounded-md border bg-background p-3 text-sm read-only:bg-muted/40" readOnly={draft.inherited} value={values.pixel ?? ""} onChange={event => edit("pixel", event.target.value)} placeholder="Insert your code here…" aria-invalid={Boolean(errors.pixel)} aria-describedby={errors.pixel ? "s2s-pixel-error" : undefined} />
            {errors.pixel && <p id="s2s-pixel-error" role="alert" className="text-sm text-rose-800">{errors.pixel}</p>}
          </div>
        </>}
        {fields.map(({ field, label, note }) => {
          const id = `${section}-${field}`;
          return <div className="space-y-1.5" key={field}>
            <label htmlFor={id} className="text-sm font-medium">{label}</label>
            <Input id={id} readOnly={draft.inherited} className="read-only:bg-muted/40" value={values[field] ?? ""} onChange={event => edit(field, event.target.value)} placeholder="https://…" aria-invalid={Boolean(errors[field])} aria-describedby={[note && `${id}-note`, errors[field] && `${id}-error`].filter(Boolean).join(" ") || undefined} />
            {note && <p id={`${id}-note`} className="text-xs text-muted-foreground">{note}</p>}
            {errors[field] && <p id={`${id}-error`} role="alert" className="text-sm text-rose-800">{errors[field]}</p>}
          </div>;
        })}
      </fieldset>
      {message && <p role="alert" className="text-sm text-rose-800">{message}</p>}
      {success && <p role="status" className="text-sm text-emerald-800">Configuration saved successfully.</p>}
      {!preview && <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <Button type="submit" disabled={!dirty || saving}>{saving ? "Saving…" : "Save Changes"}</Button>
        <Button type="button" variant="outline" disabled={!dirty || saving} onClick={cancel}>Cancel</Button>
        {dirty && <span role="status" className="text-sm text-muted-foreground">Unsaved changes</span>}
      </div>}
    </form>
  );
}
