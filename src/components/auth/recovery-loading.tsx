import { Skeleton } from "@/components/ui/skeleton";

export function RecoveryLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading password recovery"
      className="space-y-5 rounded-lg border bg-white p-6 sm:p-8"
    >
      <p className="sr-only" role="status">
        Loading password recovery…
      </p>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </section>
  );
}
