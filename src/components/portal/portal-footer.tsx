import Link from "next/link";
import { formatChangelogDate, lastUpdate } from "@/data/changelog";

export function PortalFooter() {
  return <footer className="mt-auto border-t border-border">
    <div className="mx-auto flex w-full max-w-(--portal-max-width) flex-wrap items-center justify-start gap-x-4 gap-y-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
      <span>Last Update: <time dateTime={lastUpdate}>{formatChangelogDate(lastUpdate)}</time></span>
      <Link href="/changelog" className="underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Changelog</Link>
    </div>
  </footer>;
}
