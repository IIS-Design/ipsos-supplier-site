"use client";

import { useId, useState } from "react";
import { ChevronsUpDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field-error";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { contactEmailSchema } from "@/features/contacts/contact-model";
import type { SupplierContacts, SupplierContact } from "@/types/supplier";

export function ContactPicker({ value, options, onChange, allowEmail = false, disabled = false }: {
  value: SupplierContacts; options: SupplierContacts; onChange: (contacts: SupplierContacts) => void; allowEmail?: boolean; disabled?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const candidates = [...new Map([...value, ...options].map(contact => [contact.email.toLowerCase(), contact])).values()];
  const available = candidates.filter(contact => `${contact.name} ${contact.email}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = new Set(value.map(contact => contact.email.toLowerCase()));
  function toggle(contact: SupplierContact) {
    setError("");
    if (selected.has(contact.email.toLowerCase())) onChange(value.filter(item => item.email.toLowerCase() !== contact.email.toLowerCase()));
    else if (value.length < 80) onChange([...value, contact]);
    else setError("Select up to 80 contacts.");
  }
  function addEmail() {
    const parsed = contactEmailSchema.safeParse(query);
    if (!parsed.success) { setError("Enter a valid email address."); return; }
    if (selected.has(parsed.data)) { setError("This email address is already selected."); return; }
    if (value.length >= 80) { setError("Select up to 80 contacts."); return; }
    onChange([...value, candidates.find(contact => contact.email.toLowerCase() === parsed.data) ?? { id: `draft-${crypto.randomUUID()}`, name: "", email: parsed.data }]);
    setQuery(""); setError("");
  }
  return <div className="space-y-3">
    <Popover><PopoverTrigger asChild><Button aria-label="Select contacts" disabled={disabled} variant="outline" type="button" className="w-full justify-between font-normal"><span className="truncate">{value.length ? `${value.length} contact${value.length === 1 ? "" : "s"} selected` : "Select contacts"}</span><ChevronsUpDown aria-hidden="true" className="size-4 shrink-0" /></Button></PopoverTrigger><PopoverContent align="start" className="w-96 max-w-[calc(100vw-2rem)] p-3">
      <Input aria-label={allowEmail ? "Search users or enter an email address" : "Search contacts"} placeholder={allowEmail ? "Search users or enter an email…" : "Search contacts…"} value={query} onChange={event => { setQuery(event.target.value); setError(""); }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); if (allowEmail) addEmail(); } }} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />
      <div className="mt-2 max-h-60 space-y-1 overflow-y-auto" role="group" aria-label="Available contacts">{available.map(contact => <label key={contact.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-muted focus-within:ring-2 focus-within:ring-ring"><Checkbox disabled={disabled} checked={selected.has(contact.email.toLowerCase())} onCheckedChange={() => toggle(contact)} /><span className="min-w-0 wrap-break-word">{contact.name ? `${contact.name} (${contact.email})` : contact.email}</span></label>)}{!available.length && <p className="p-2 text-sm text-muted-foreground">No contacts match your search.</p>}</div>
      {allowEmail && <Button type="button" variant="ghost" className="mt-2 w-full justify-start" onClick={addEmail} disabled={disabled || !query.trim()}><Plus aria-hidden="true" className="size-4" />Add email address</Button>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </PopoverContent></Popover>
    <div className="flex flex-wrap gap-2" aria-label="Selected contacts">{value.map(contact => <Badge variant="secondary" key={contact.id} className="max-w-full gap-1 whitespace-normal py-1 pl-3 pr-1"><span className="min-w-0 wrap-break-word">{contact.name ? `${contact.name} (${contact.email})` : contact.email}</span><button aria-label={`Remove ${contact.email}`} disabled={disabled} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" type="button" onClick={() => onChange(value.filter(item => item.id !== contact.id))}><X aria-hidden="true" className="size-3.5" /></button></Badge>)}</div>
    {!value.length && <p className="text-sm text-muted-foreground">No contacts selected.</p>}
  </div>;
}
