import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div
      aria-label="Loading Projects workspace"
      aria-live="polite"
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <section className="projects-explorer min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-72 max-w-full" />
        </div>
        <div className="project-filters grid min-w-0 gap-2 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="project-date-range h-10 w-full sm:col-span-2" />
        </div>
        <div className="divide-y border-y">
          {[0, 1, 2, 3].map((row) => (
            <div className="space-y-3 py-4" key={row}>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-64 max-w-full" />
        </div>
      </section>
      <aside aria-hidden="true" className="space-y-4">
        {[0].map((card) => (
          <div className="space-y-4 rounded-lg border bg-white p-4" key={card}>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-9 w-full" />
            {[0, 1, 2].map((row) => (
              <Skeleton className="h-12 w-full" key={row} />
            ))}
          </div>
        ))}
      </aside>
    </div>
  );
}
