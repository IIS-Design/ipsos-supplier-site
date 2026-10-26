"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ReportErrorDetails({ message, reportId, className, children }: { message?: string; reportId: string; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const keepOpen = () => { if (timer.current) clearTimeout(timer.current); setOpen(true); };
  const closeSoon = () => { timer.current = setTimeout(() => setOpen(false), 150); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label={`View error for ${reportId}`} className={className} onMouseEnter={keepOpen} onMouseLeave={closeSoon} onClick={(event) => { event.preventDefault(); keepOpen(); }} type="button">{children}</button>
      </PopoverTrigger>
      <PopoverContent aria-labelledby={id} onOpenAutoFocus={(event) => event.preventDefault()} onMouseEnter={keepOpen} onMouseLeave={closeSoon} side="left">
        <h3 className="mb-1 text-sm font-semibold" id={id}>Report Error</h3>
        <p className="text-sm">{message || "The report could not be generated. Please try again."}</p>
      </PopoverContent>
    </Popover>
  );
}
