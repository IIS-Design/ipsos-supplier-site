import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectWorkspaceLoading() {
  return (
    <div
      aria-label="Loading subsample workspace"
      aria-live="polite"
      className="space-y-5"
    >
      <Skeleton className="h-5 w-80 max-w-full" />
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-5 border-r pr-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    </div>
  );
}
