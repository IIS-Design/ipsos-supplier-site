"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function SubsampleListError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <section aria-labelledby="all-subsamples-heading" className="rounded-md border p-6" role="alert"><h1 id="all-subsamples-heading" className="text-xl font-semibold">Subsamples unavailable</h1><p className="mt-2 text-muted-foreground">We could not load the subsamples for this project. Please try again.</p><Button className="mt-4" type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Retrying…" : "Try Again"}</Button></section>;
}
