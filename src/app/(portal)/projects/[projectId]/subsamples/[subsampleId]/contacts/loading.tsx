import { Skeleton } from "@/components/ui/skeleton";

export default function ContactsLoading() {
  return (
    <section
      aria-label="Loading Subsample Contacts"
      aria-busy="true"
      className="space-y-5"
    >
      <p className="sr-only" role="status">
        Loading contacts…
      </p>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-64" />
      {[0, 1, 2, 3].map((row) => (
        <Skeleton className="h-20 w-full" key={row} />
      ))}
    </section>
  );
}
