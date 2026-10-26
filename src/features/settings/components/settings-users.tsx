"use client";

import { withBasePath } from "@/lib/app-path";

import { useState } from "react";
import { useMockAuth } from "@/components/auth/mock-auth-provider";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal, UserPlus, UserRoundPen, KeyRound, UserRoundX } from "lucide-react";
import { managedProfileSchema, type UserManagementRequest } from "@/features/settings/settings-model";
import type { z } from "zod";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useUnsavedChanges } from "@/features/contacts/use-unsaved-changes";

type Profile = z.infer<typeof managedProfileSchema>;
async function manage(request: UserManagementRequest) {
  const response = await fetch(withBasePath("/api/settings/users/"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "Unable to update this user.");
  return data.user as User;
}
export function SettingsUsers({ users, actorId }: { users: User[]; actorId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editor, setEditor] = useState<User | "invite" | null>(null);
  const [action, setAction] = useState<{ user: User; type: "deactivate" | "activate" | "reset-password" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<"user-invitation" | "reset-password" | null>(null);
  const rows = users.filter(user => (!query.trim() || `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())) && (status === "all" || (user.status ?? "active") === status));
  async function confirmAction() {
    if (!action) return;
    setBusy(true); setError(""); setMessage(""); setPreview(null);
    try {
      await manage({ action: action.type, userId: action.user.id });
      setMessage(action.type === "reset-password" ? "Password reset email prepared." : "User status updated.");
      if (action.type === "reset-password") setPreview("reset-password");
      setAction(null); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to connect to the service."); } finally { setBusy(false); }
  }
  return <div className="space-y-5">
    {message && <p role="status" className="text-emerald-800">{message}</p>}
    {error && !action && <p role="alert" className="text-destructive">{error}</p>}
    {preview && <Button asChild variant="outline"><a href={withBasePath(`/email-preview/${preview}/`)} target="_blank" rel="noopener noreferrer">Open {preview === "user-invitation" ? "Invitation" : "Reset Password"} Email</a></Button>}
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]"><Input aria-label="Search users" placeholder="Search users…" value={query} onChange={event => setQuery(event.target.value)} /><Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Filter users by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="invited">Invited</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><Button variant="outline" onClick={() => setEditor("invite")}><UserPlus aria-hidden="true" className="size-4" />Invite User</Button></div>
    <Table className="table-fixed"><TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Email</TableHead><TableHead className="hidden sm:table-cell">Role</TableHead><TableHead className="w-24">Status</TableHead><TableHead className="w-12"><span className="sr-only">User actions</span></TableHead></TableRow></TableHeader><TableBody>{rows.map(user => <TableRow key={user.id} className={(user.status ?? "active") === "inactive" ? "text-muted-foreground" : ""}><TableCell className="whitespace-normal wrap-break-word"><p>{user.firstName} {user.lastName}</p><p className="text-xs text-muted-foreground md:hidden">{user.email}</p><p className="text-xs text-muted-foreground sm:hidden">{user.role === "admin" ? "Administrator" : "User"}</p></TableCell><TableCell className="hidden whitespace-normal wrap-break-word md:table-cell">{user.email}</TableCell><TableCell className="hidden sm:table-cell">{user.role === "admin" ? "Administrator" : "User"}</TableCell><TableCell><Badge variant="outline" className="capitalize">{user.status ?? "active"}</Badge></TableCell><TableCell className="px-0"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-label={`Actions for ${user.firstName} ${user.lastName}`} className="size-11 px-0" variant="ghost"><MoreHorizontal aria-hidden="true" className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => setEditor(user)}><UserRoundPen aria-hidden="true" className="size-4" />Edit User</DropdownMenuItem><DropdownMenuItem disabled={(user.status ?? "active") !== "active"} onSelect={() => { setError(""); setAction({ user, type: "reset-password" }); }}><KeyRound aria-hidden="true" className="size-4" />Reset Password</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem disabled={user.id === actorId || user.status === "invited"} onSelect={() => { setError(""); setAction({ user, type: user.status === "inactive" ? "activate" : "deactivate" }); }}><UserRoundX aria-hidden="true" className="size-4" />{user.status === "inactive" ? "Activate User" : "Deactivate User"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table>
    {!rows.length && <p className="py-8 text-center text-muted-foreground">No users match these filters.</p>}
    {editor && <UserEditor key={editor === "invite" ? "invite" : editor.id} user={editor === "invite" ? undefined : editor} actorId={actorId} onClose={() => setEditor(null)} onSaved={invited => { setEditor(null); setError(""); setMessage(invited ? "Invitation prepared successfully." : "User saved successfully."); setPreview(invited ? "user-invitation" : null); router.refresh(); }} />}
    <AlertDialog open={!!action} onOpenChange={open => { if (!open && !busy) setAction(null); }}><AlertDialogContent><AlertDialogTitle>{action?.type === "reset-password" ? "Reset Password" : action?.type === "activate" ? "Activate User" : "Deactivate User"}</AlertDialogTitle><AlertDialogDescription>{action?.type === "reset-password" ? "Prepare a password reset email for" : action?.type === "activate" ? "Restore access for" : "Remove access for"} {action?.user.firstName} {action?.user.lastName}?</AlertDialogDescription>{error && <p role="alert" className="text-destructive">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><Button disabled={busy} onClick={() => void confirmAction()}>{busy ? "Updating…" : "Confirm"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
function UserEditor({ user, actorId, onClose, onSaved }: { user?: User; actorId: string; onClose: () => void; onSaved: (invited: boolean) => void }) {
  const [error, setError] = useState("");
  const { updateUser } = useMockAuth();
  const { register, handleSubmit, control, setValue, formState: { errors, isDirty, isSubmitting } } = useForm<Profile>({ resolver: zodResolver(managedProfileSchema), defaultValues: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } : { firstName: "", lastName: "", email: "", role: "user" } });
  const role = useWatch({ control, name: "role" });
  const release = useUnsavedChanges(isDirty, "Discard the unsaved user details?");
  const close = () => { if (!isSubmitting && (!isDirty || window.confirm("Discard the unsaved user details?"))) { release(); onClose(); } };
  const save = handleSubmit(async profile => {
    setError("");
    try { const saved = await manage(user ? { action: "edit", userId: user.id, profile } : { action: "invite", profile }); if (saved.id === actorId) updateUser(saved); release(); onSaved(!user); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to connect to the service."); }
  });
  return <Dialog open onOpenChange={open => { if (!open) close(); }}><DialogContent><DialogTitle className="text-lg font-semibold">{user ? "Edit User" : "Invite User"}</DialogTitle><DialogDescription className="sr-only">Enter the user’s email, name and role.</DialogDescription><form className="mt-6 space-y-5" noValidate aria-busy={isSubmitting} onSubmit={save}>{error && <p role="alert" className="text-destructive">{error}</p>}<fieldset disabled={isSubmitting} className="space-y-5"><div className="space-y-1.5"><label htmlFor="managed-email">Email Address</label><Input {...register("email")} type="email" id="managed-email" autoComplete="off" aria-invalid={!!errors.email} aria-describedby={errors.email ? "managed-email-error" : undefined} />{errors.email && <FieldError id="managed-email-error">{errors.email.message}</FieldError>}</div><div className="grid gap-4 sm:grid-cols-2">{(["firstName", "lastName"] as const).map(key => <div key={key} className="space-y-1.5"><label htmlFor={`managed-${key}`}>{key === "firstName" ? "First Name" : "Last Name"}</label><Input {...register(key)} id={`managed-${key}`} aria-invalid={!!errors[key]} />{errors[key] && <FieldError>{errors[key].message}</FieldError>}</div>)}</div><div className="space-y-1.5"><label htmlFor="managed-role">Role</label><Select disabled={user?.id === actorId} value={role} onValueChange={value => setValue("role", value as Profile["role"], { shouldDirty: true })}><SelectTrigger id="managed-role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Administrator</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select></div></fieldset><div className="flex gap-3"><Button disabled={isSubmitting || (Boolean(user) && !isDirty)} type="submit">{isSubmitting ? "Saving…" : user ? "Save" : "Send Invitation"}</Button><Button disabled={isSubmitting} type="button" variant="ghost" onClick={close}>Cancel</Button></div></form></DialogContent></Dialog>;
}
