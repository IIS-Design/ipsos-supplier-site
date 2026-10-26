import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <section
      aria-label="Loading Reports"
      aria-live="polite"
      className="mx-auto max-w-5xl space-y-5"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton className="h-24 w-full" key={item} />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </section>
  );
}
