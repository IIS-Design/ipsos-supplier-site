import type { ComponentProps } from "react";
import { CalendarDays } from "lucide-react";
import { formControlStyles } from "@/components/ui/form-control";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  const input = (
    <input
      className={cn(
        formControlStyles,
        "flex w-full file:border-0 file:bg-transparent file:text-sm file:font-medium",
        type === "date" && "portal-date-input min-w-0 pr-10",
        className,
      )}
      type={type}
      {...props}
    />
  );
  return type === "date" ? (
    <div className="relative min-w-0">
      {input}
      <CalendarDays aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  ) : input;
}
