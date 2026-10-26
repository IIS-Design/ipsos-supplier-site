"use client";

import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      closeButton
      offset={{ bottom: 64, left: 16, right: 16 }}
      mobileOffset={{ bottom: 64, left: 16, right: 16 }}
      position="bottom-right"
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            "group toast border-border bg-background text-foreground shadow-lg",
          description: "text-muted-foreground",
          closeButton: "border-border bg-background text-foreground",
        },
      }}
      {...props}
    />
  );
}
