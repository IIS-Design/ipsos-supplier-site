import { Skeleton } from "@/components/ui/skeleton";
export function SubsampleCardsSkeleton() {
  return <section aria-label="Loading subsamples" aria-busy="true" className="space-y-5"><h1 id="all-subsamples-heading" className="sr-only">Loading subsamples</h1><p role="status" className="sr-only">Loading subsamples…</p><Skeleton className="h-8 w-64 max-w-full" /><Skeleton className="h-10 w-full" /><div className="grid grid-cols-2 gap-3">{[0,1,2,3].map(id => <Skeleton key={id} className="h-10" />)}</div>{[0,1,2].map(id => <div key={id} className="space-y-3 rounded-md border p-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><div className="grid grid-cols-3 gap-3">{[0,1,2,3,4,5].map(field => <Skeleton key={field} className="h-9" />)}</div></div>)}</section>;
}
