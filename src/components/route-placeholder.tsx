import Link from "next/link";

export function RoutePlaceholder({ title }: { title: string }) {
  return (
    <section
      aria-labelledby="page-title"
      className="rounded-lg border bg-white p-6 shadow-sm"
    >
      <p className="text-sm font-medium text-muted-foreground">
        Ipsos Supplier Portal
      </p>
      <h1
        className="mt-2 text-2xl font-semibold tracking-tight"
        id="page-title"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        No content is available here yet.
      </p>
      <Link
        className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline"
        href="/projects"
      >
        Return to Projects
      </Link>
    </section>
  );
}
