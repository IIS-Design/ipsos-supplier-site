import Link from "next/link";
import type { Subsample } from "@/types/subsample";

const statusLabels: Record<Subsample["status"], string> = {
  live: "Live",
  pending: "Pending",
  canceled: "Canceled",
};

const statusStyles: Record<Subsample["status"], string> = {
  live: "text-emerald-800",
  pending: "text-slate-600",
  canceled: "text-slate-600",
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function SubsampleSummary({ subsample, wholeRowLink = false }: { subsample: Subsample; wholeRowLink?: boolean }) {
  return (
    <li className="relative py-1.5 before:absolute before:-left-4 before:top-4 before:w-3 before:border-t before:border-border">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Link
          className={`min-w-0 text-base font-medium leading-5 text-foreground underline-offset-4 hover:text-primary hover:underline ${wholeRowLink ? "after:absolute after:inset-0 after:rounded-sm after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring" : ""}`}
          href={`/projects/${subsample.projectId}/subsamples/${subsample.id}`}
        >
          {subsample.name}
        </Link>
      </div>
      <dl className="mt-0.5 flex flex-wrap items-center gap-y-0.5 [&>div+div]:before:mx-2 [&>div+div]:before:text-muted-foreground [&>div+div]:before:content-['·'] [&>div]:flex [&>div]:items-center [&>div]:whitespace-nowrap text-sm leading-5 text-foreground">
        <div><dt className="sr-only">Status</dt><dd><span
          className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-medium ${statusStyles[subsample.status]}`}
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${subsample.status === "live" ? "bg-emerald-700" : "bg-slate-500"}`}
          />
          {statusLabels[subsample.status]}
        </span></dd></div>
        <div className="flex gap-1">
          <dt className="text-muted-foreground">Language:</dt>
          <dd className="text-foreground">{subsample.language}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="text-muted-foreground">Field End Date:</dt>
          <dd className="text-foreground">
            {formatDate(subsample.fieldEndDate)}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt className="text-muted-foreground">Incidence:</dt>
          <dd className="text-foreground">{subsample.incidence}%</dd>
        </div>
        <div className="flex gap-1">
          <dt className="text-muted-foreground">Remaining:</dt>
          <dd className="text-foreground">
            {subsample.exclusiveRemaining + subsample.sharedRemaining}
          </dd>
        </div>
      </dl>
    </li>
  );
}
