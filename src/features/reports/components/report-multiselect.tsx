"use client";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export function ReportMultiselect({ label, options, value, onChange, placeholder = "Please select...", max, searchable = true, errorId }: { searchable?: boolean; errorId?: string; label: string; options: { id: string; label: string; description?: string }[]; value: string[]; onChange: (ids: string[]) => void; placeholder?: string; max?: number }) {
  const [query, setQuery] = useState("");
  const matches = options.filter(o => `${o.label} ${o.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const combined = [...new Set([...value, ...matches.map(o => o.id)])];
  return <div className="space-y-2"><Popover><PopoverTrigger asChild><Button aria-label={label} aria-invalid={Boolean(errorId)} aria-describedby={errorId} variant="outline" className="h-auto min-h-10 w-full justify-between text-left font-normal"><span>{value.length ? `${value.length}${max ? `/${max}` : ""} selected` : placeholder}</span><ChevronDown className="size-4" /></Button></PopoverTrigger><PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 max-w-[calc(100vw-2rem)] p-2" align="start">
    {searchable && <Input aria-label={`Search ${label.toLowerCase()}`} placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />}
    <div className="flex justify-between gap-2 py-2"><Button size="sm" variant="ghost" type="button" disabled={!matches.length || Boolean(max && combined.length > max)} onClick={() => onChange(combined)}>Select all{query ? " results" : ""}</Button><Button size="sm" variant="ghost" type="button" disabled={!value.length} onClick={() => onChange([])}>Deselect all</Button></div>
    {max && <p className="px-2 pb-2 text-xs text-muted-foreground">Select up to {max} subsamples ({value.length}/{max}).</p>}
    <div className="max-h-64 overflow-y-auto">{matches.map(o => <label key={o.id} className="flex cursor-pointer items-start gap-2 rounded p-2 text-sm hover:bg-accent"><Checkbox checked={value.includes(o.id)} disabled={!value.includes(o.id) && Boolean(max && value.length >= max)} onCheckedChange={checked => onChange(checked ? [...value, o.id] : value.filter(id => id !== o.id))} /><span><span className="block">{o.label}</span>{o.description && <span className="block text-xs text-muted-foreground">{o.description}</span>}</span></label>)}{!matches.length && <p className="p-3 text-sm text-muted-foreground">No matching options.</p>}</div>
    </PopoverContent></Popover><div className="flex flex-wrap gap-1">{value.map(id => <button key={id} type="button" onClick={() => onChange(value.filter(v => v !== id))} className="inline-flex max-w-full items-center gap-1 rounded border px-2 py-1 text-xs" aria-label={`Remove ${options.find(o => o.id === id)?.label ?? id}`}><span className="truncate">{options.find(o => o.id === id)?.label ?? id}</span><X className="size-3 shrink-0" /></button>)}</div></div>;
}
