import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
      <p className="text-sm font-semibold text-primary">
        Ipsos Supplier Portal
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The requested page does not exist or is no longer available.
      </p>
      <Link
        className="mt-6 w-fit font-medium text-primary underline-offset-4 hover:underline"
        href="/projects"
      >
        Return to the portal
      </Link>
    </main>
  );
}
