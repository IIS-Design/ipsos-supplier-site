import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function FieldError({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} className={cn("text-sm text-rose-800", className)} role="alert" />;
}
