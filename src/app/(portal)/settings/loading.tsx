import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <section
      aria-label="Loading Settings"
      aria-busy="true"
      className="max-w-4xl space-y-5"
    >
      <p className="sr-only" role="status">
        Loading settings…
      </p>
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-12 w-full" />
      {[0, 1, 2, 3].map((row) => (
        <Skeleton className="h-20 w-full" key={row} />
      ))}
    </section>
  );
}
