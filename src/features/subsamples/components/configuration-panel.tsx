import Link from "next/link";
import { ArrowLeftRight, Link2, Route, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfigurationSection =
  | "entry-links"
  | "redirects"
  | "server-to-server"
  | "security";

const sections: {
  id: ConfigurationSection;
  label: string;
  Icon: typeof Link2;
}[] = [
  { id: "entry-links", label: "Entry Links", Icon: Link2 },
  { id: "redirects", label: "Redirects", Icon: Route },
  { id: "server-to-server", label: "Server-to-Server", Icon: ArrowLeftRight },
  { id: "security", label: "Security", Icon: ShieldCheck },
];

export function ConfigurationPanel({
  projectId,
  subsampleId,
  activeSection,
}: {
  projectId: string;
  subsampleId: string;
  activeSection: ConfigurationSection;
}) {
  const base = `/projects/${projectId}/subsamples/${subsampleId}/configuration`;
  const active =
    sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
      <nav
        aria-label="Configuration sections"
        className="space-y-1 border-b pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-5"
      >
        <h2 className="mb-3 text-sm font-semibold">Configuration</h2>
        {sections.map(({ id, label, Icon }) => (
          <Link
            aria-current={activeSection === id ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeSection === id && "bg-muted font-medium text-foreground",
            )}
            href={`${base}?section=${id}`}
            key={id}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <section
        aria-labelledby="configuration-section-title"
        className="min-h-48"
      >
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {active.label}
        </h2>
        <div className="mt-4 rounded-md border border-dashed px-4 py-8 text-sm text-muted-foreground">
          <h3
            className="font-medium text-foreground"
            id="configuration-section-title"
          >
            {active.label}
          </h3>
          <p className="mt-2">No editable settings are available here yet.</p>
          <Link
            className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline"
            href={`/projects/${projectId}/subsamples/${subsampleId}/details`}
          >
            Return to Subsample Details
          </Link>
        </div>
      </section>
    </div>
  );
}
