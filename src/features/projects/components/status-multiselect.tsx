"use client";

import { useId, useState } from "react";
import { isProjectStatus, statusLabels } from "@/types/status";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formControlStyles } from "@/components/ui/form-control";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function StatusMultiselect<T extends string>({ label, values, options, onChange, optionLabel, showLabel = false }: {
  showLabel?: boolean;
  optionLabel?: (value: T) => string;
  label: string;
  values: T[];
  options: readonly T[];
  onChange: (values: T[]) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const title = (value: T) => optionLabel ? optionLabel(value) : isProjectStatus(value) ? statusLabels[value] : value.charAt(0).toUpperCase() + value.slice(1);
  const summary = values.length ? `${values.length} selected` : "All";
  return <div className="min-w-0 space-y-2">
    {showLabel && <label htmlFor={id} className="block text-sm font-medium">{label}</label>}
    <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button id={id} type="button" variant="outline" aria-label={`${label}: ${summary}`} className={cn(formControlStyles, "w-full min-w-0 justify-between gap-2 font-normal shadow-none")}>
        <span className="truncate">{values.length ? summary : showLabel ? "All" : label}</span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="z-80 w-(--radix-popover-trigger-width) min-w-48 space-y-3" align="start">
      <fieldset className="space-y-3">
        <legend className="sr-only">{label}</legend>
        {options.map(option => <label key={option} className="flex cursor-pointer items-center gap-3 text-sm">
          <Checkbox checked={values.includes(option)} onCheckedChange={checked => onChange(checked ? [...values, option] : values.filter(value => value !== option))} />
          {title(option)}
        </label>)}
      </fieldset>
    </PopoverContent>
  </Popover>
  </div>;
}
