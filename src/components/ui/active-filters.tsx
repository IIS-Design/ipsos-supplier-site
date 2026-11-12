"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

export type ActiveFilter = { id: string; label: string; className?: string; remove: () => void };
export function ActiveFilters({ filters, onClear }: { filters: ActiveFilter[]; onClear: () => void }) {
  if (!filters.length) return null;
  return <div aria-label="Active filters" className="flex flex-wrap items-center gap-2 border-b pb-3">
    <span className="mr-1 text-xs text-muted-foreground">Filtering by</span>
    {filters.map(filter => <button key={filter.id} type="button" onClick={filter.remove} aria-label={`Remove ${filter.label} filter`} className={cn("inline-flex min-h-8 max-w-full items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", filter.className)}>
      <span className="break-words text-left">{filter.label}</span><X aria-hidden="true" className="size-3 shrink-0" />
    </button>)}
    <Button type="button" variant="ghost" size="sm" onClick={onClear} className="ml-auto h-7 gap-1 px-2 text-xs [&_svg]:size-3"><X aria-hidden="true" className="size-3.5" />Clear Filters</Button>
  </div>;
}
