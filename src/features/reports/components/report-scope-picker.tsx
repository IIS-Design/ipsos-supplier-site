"use client";

import { useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formControlStyles } from "@/components/ui/form-control";
import { cn } from "@/lib/utils";

export type ScopeOption = { key: string; label: string; description: string };
export function ReportScopePicker({ options, value, onChange }: { options: ScopeOption[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const id = useId();
  const selected = options.find(option => option.key === value);
  const matches = options.filter(option => `${option.label} ${option.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const choose = (key: string) => { onChange(key); setOpen(false); };
  return <Popover open={open} onOpenChange={next => { setOpen(next); if (next) { setQuery(""); setActive(0); } }}>
    <PopoverTrigger asChild><Button id="report-scope" aria-label="Select project or subsample" variant="outline" className={cn(formControlStyles, "h-auto min-h-10 w-full justify-between gap-3 text-left font-normal")}>
      <span className="min-w-0">{selected ? <><span className="block break-words">{selected.label}</span><span className="mt-1 block break-words text-xs text-muted-foreground">{selected.description}</span></> : "Please select..."}</span><ChevronDown aria-hidden="true" className="size-4 shrink-0" />
    </Button></PopoverTrigger>
    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
      <Input role="combobox" aria-label="Search projects and subsamples" aria-expanded={open} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={matches[active] ? `${id}-${active}` : undefined} value={query} placeholder="Search by name, SID, ID or country…" onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const next = Math.max(0, Math.min(matches.length - 1, active + (event.key === "ArrowDown" ? 1 : -1))); setActive(next); document.getElementById(`${id}-${next}`)?.scrollIntoView({ block: "nearest" }); }
        if (event.key === "Enter") { event.preventDefault(); if (matches[active]) choose(matches[active].key); }
      }} />
      <div id={`${id}-list`} role="listbox" aria-label="Projects and subsamples" className="mt-2 max-h-72 overflow-y-auto">
        {matches.map((option, index) => <button type="button" role="option" aria-selected={value === option.key} id={`${id}-${index}`} key={option.key} tabIndex={-1} onMouseEnter={() => setActive(index)} onClick={() => choose(option.key)} className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm", index === active && "bg-accent")}>
          <span className="min-w-0 flex-1"><span className="block break-words">{option.label}</span><span className="mt-1 block break-words text-xs text-muted-foreground">{option.description}</span></span>{value === option.key && <Check className="size-4 shrink-0" aria-hidden="true" />}
        </button>)}
        {!matches.length && <p className="px-3 py-5 text-sm text-muted-foreground">No projects or subsamples match your search.</p>}
      </div>
    </PopoverContent>
  </Popover>;
}
