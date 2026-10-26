"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, type AccountProfile } from "./account-model";
import { useMockAuth } from "@/components/auth/mock-auth-provider";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import type { User } from "@/types/user";

function PersonalInformation({ user, onDirtyChange }: { user: User; onDirtyChange: (dirty: boolean) => void }) {
  const { updateUser } = useMockAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<AccountProfile>({ resolver: zodResolver(accountSchema), defaultValues: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  useEffect(() => { onDirtyChange(isDirty); return () => onDirtyChange(false); }, [isDirty, onDirtyChange]);
  useUnsavedChanges(isDirty, "You have unsaved account changes. Leave this page and discard them?");
  const submit = handleSubmit(async (profile) => {
    setError(""); setSuccess("");
    try {
      const response = await fetch("/api/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile), signal: AbortSignal.timeout(15000) });
      const payload = await response.json() as { user?: User; message?: string };
      if (!response.ok || !payload.user) { setError(payload.message || "Your account could not be saved. Please try again."); return; }
      updateUser(payload.user);
      reset({ firstName: payload.user.firstName, lastName: payload.user.lastName, email: payload.user.email });
      setSuccess("Your personal information has been saved.");
      router.refresh();
    } catch { setError("Unable to connect to the service. Your changes are still available. Please try again."); }
  });
  return (
    <form aria-busy={isSubmitting} className="max-w-xl space-y-5" noValidate onSubmit={submit}>
      <h2 className="text-lg font-semibold">Personal Information</h2>
      {error ? <FieldError>{error}</FieldError> : null}
      {success ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">{success}</p> : null}
      {([{ name: "firstName", label: "First Name", autoComplete: "given-name" }, { name: "lastName", label: "Last Name", autoComplete: "family-name" }, { name: "email", label: "Email Address", autoComplete: "email" }] as const).map(field => (
        <div className="space-y-2" key={field.name}>
          <label className="block text-sm font-medium" htmlFor={`account-${field.name}`}>{field.label}</label>
          <Input {...register(field.name)} aria-describedby={errors[field.name] ? `account-${field.name}-error` : undefined} aria-invalid={Boolean(errors[field.name])} autoComplete={field.autoComplete} disabled={isSubmitting} id={`account-${field.name}`} maxLength={field.name === "email" ? 254 : 100} type={field.name === "email" ? "email" : "text"} />
          {errors[field.name] ? <FieldError id={`account-${field.name}-error`}>{errors[field.name]?.message}</FieldError> : null}
        </div>
      ))}
      <div className="flex gap-2">
        <Button disabled={!isDirty || isSubmitting} type="submit">{isSubmitting ? "Saving…" : "Save"}</Button>
        <Button disabled={!isDirty || isSubmitting} onClick={() => { reset(); setError(""); setSuccess(""); }} type="button" variant="outline">Cancel</Button>
      </div>
      <span className="sr-only" role="status">{isSubmitting ? "Saving your account. Please wait." : ""}</span>
    </form>
  );
}

function Security({ email }: { email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const changePassword = async () => {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/password-recovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) { const payload = await response.json() as { message?: string }; setError(payload.message || "Unable to request a password reset. Please try again."); return; }
      router.push("/forgot-password/confirmation");
    } catch { setError("Unable to connect to the service. Please try again."); }
    finally { setPending(false); }
  };
  return <section aria-busy={pending} className="max-w-xl space-y-5">
    <h2 className="text-lg font-semibold">Security</h2>
    {error ? <FieldError>{error}</FieldError> : null}
    <div className="space-y-1"><h3 className="text-sm font-medium">Password</h3><p aria-label="Password is hidden" className="tracking-widest">************</p></div>
    <p className="text-sm text-muted-foreground">Use a reset link sent to your email address to change your password.</p>
    <Button disabled={pending} onClick={changePassword} type="button" variant="outline">{pending ? "Requesting Reset…" : "Change Password"}</Button>
    <span className="sr-only" role="status">{pending ? "Requesting your password reset. Please wait." : ""}</span>
  </section>;
}

export function AccountSettings({ user: initialUser }: { user: User }) {
  const { user } = useMockAuth();
  const current = user || initialUser;
  const [tab, setTab] = useState("personal");
  const [dirty, setDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  return <section className="space-y-5">
    <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
    <Tabs onValueChange={value => { if (dirty) setPendingTab(value); else setTab(value); }} value={tab}>
      <TabsList aria-label="Account settings sections" variant="line"><TabsTrigger value="personal">Personal Information</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger></TabsList>
      <TabsContent className="pt-5" value="personal"><PersonalInformation user={current} onDirtyChange={setDirty} /></TabsContent>
      <TabsContent className="pt-5" value="security"><Security email={current.email} /></TabsContent>
    </Tabs>
    <AlertDialog open={Boolean(pendingTab)} onOpenChange={open => { if (!open) setPendingTab(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle><AlertDialogDescription>Your personal information has not been saved. Discard these changes and switch sections?</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Keep Editing</AlertDialogCancel><AlertDialogAction onClick={() => { if (pendingTab) setTab(pendingTab); setPendingTab(null); }}>Discard Changes</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}
