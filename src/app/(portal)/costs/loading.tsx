import { Skeleton } from "@/components/ui/skeleton";

export default function CostsLoading() {
  return (
    <section
      aria-label="Loading Costs workspace"
      aria-live="polite"
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_160px_160px]">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton className="h-10 w-full" key={item} />
        ))}
      </div>
      <div className="space-y-3 border-y py-3">
        {[0, 1, 2, 3, 4].map((row) => (
          <Skeleton className="h-12 w-full" key={row} />
        ))}
      </div>
    </section>
  );
}
