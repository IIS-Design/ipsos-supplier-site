"use client";

import * as React from "react";
import { DropdownMenu as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export function DropdownMenuContent({ className, ...props }: React.ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Content align="end" sideOffset={8} collisionPadding={12} className={cn("z-80 min-w-48 rounded-md border bg-popover p-1 text-sm text-popover-foreground shadow-md", className)} {...props} /></Primitive.Portal>;
}
export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item className={cn("flex min-h-10 cursor-pointer items-center gap-2 rounded-sm px-3 py-2 outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50", className)} {...props} />;
}
export function DropdownMenuSeparator() { return <Primitive.Separator className="my-1 h-px bg-border" />; }
