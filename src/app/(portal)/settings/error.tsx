"use client";

import { Button } from "@/components/ui/button";

export default function SettingsError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <section className="max-w-2xl space-y-4 rounded-md border p-6" role="alert">
      <h1 className="text-xl font-semibold">
        Organization Contacts unavailable
      </h1>
      <p className="text-sm text-muted-foreground">
        We could not load contact defaults. Please try again.
      </p>
      <Button onClick={retry} type="button">
        Try Again
      </Button>
    </section>
  );
}
