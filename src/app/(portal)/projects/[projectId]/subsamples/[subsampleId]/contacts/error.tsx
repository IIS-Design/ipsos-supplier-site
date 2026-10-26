"use client";

import { Button } from "@/components/ui/button";

export default function ContactsError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <section className="space-y-4 rounded-md border p-5" role="alert">
      <h2 className="text-lg font-semibold">Contacts unavailable</h2>
      <p className="text-sm text-muted-foreground">
        We could not load these contacts. Please try again.
      </p>
      <Button onClick={retry} type="button">
        Try Again
      </Button>
    </section>
  );
}
