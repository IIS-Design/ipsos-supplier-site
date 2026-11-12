import type { Metadata } from "next";
import { changelog, formatChangelogDate } from "@/data/changelog";

export const metadata: Metadata = { title: "Changelog" };

export default function ChangelogPage() {
  return <section aria-labelledby="changelog-heading" className="mx-auto max-w-3xl space-y-8">
    <header className="space-y-2">
      <h1 id="changelog-heading" className="text-2xl font-semibold tracking-tight">Changelog</h1>
      <p className="text-sm text-muted-foreground">Daily summaries of implemented changes, validation and open decisions for project managers, developers and AI collaborators. Latest updates appear first.</p>
    </header>
    {changelog.map(entry => <article key={entry.date} aria-labelledby={`day-${entry.date}`} className="space-y-4 border-t pt-6">
      <header className="space-y-1">
        <time dateTime={entry.date} className="text-sm text-muted-foreground">{formatChangelogDate(entry.date)}</time>
        <h2 id={`day-${entry.date}`} className="text-lg font-semibold">{entry.title}</h2>
      </header>
      <ul className="list-disc space-y-2 pl-5 text-sm leading-6">{entry.changes.map(change => <li key={change}>{change}</li>)}</ul>
      {entry.validation && <p className="text-sm leading-6"><span className="font-medium">Validation: </span>{entry.validation}</p>}
      {entry.pending && <p className="text-sm leading-6"><span className="font-medium">Pending: </span>{entry.pending}</p>}
      <p className="text-xs leading-5 text-muted-foreground">{entry.source}</p>
    </article>)}
  </section>;
}
