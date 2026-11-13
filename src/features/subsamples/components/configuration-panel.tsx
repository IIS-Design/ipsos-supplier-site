"use client";

import { EntryLinks } from "./entry-links";
import type { Subsample } from "@/types/subsample";
import { LinkConfigurationForm } from "./link-configuration-form";
import { useConfigurationState, type ConfigKey } from "./configuration-state";
import { usePrototypeState } from "@/components/prototype-state";
import { ScenarioEmpty } from "./scenario-preview";
import Link from "next/link";
import { ArrowLeftRight, Link2, Route } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfigurationSection =
  | "entry-links"
  | "redirects"
  | "server-to-server";

const sections: {
  id: ConfigurationSection;
  label: string;
  Icon: typeof Link2;
}[] = [
  { id: "entry-links", label: "Entry Links", Icon: Link2 },
  { id: "redirects", label: "Redirects", Icon: Route },
  { id: "server-to-server", label: "Server-to-Server", Icon: ArrowLeftRight },
];

export function ConfigurationPanel({
  projectId,
  subsampleId,
  activeSection,
  subsample,
}: {
  projectId: string;
  subsampleId: string;
  activeSection: ConfigurationSection;
  subsample: Subsample;
}) {
  const { scenario, setScenario } = usePrototypeState();
  const config = useConfigurationState();
  const key: ConfigKey = activeSection === "server-to-server" ? "server-to-server" : "redirects";
  const preview = ["defaults", "custom", "link-tokens", "link-invalid"].includes(scenario);
  const previewValues = {
    ...config.sections[key].values,
    ...(scenario === "link-tokens" ? {
      [key === "redirects" ? "completes" : "complete"]: "https://supplier.example/complete?uid=<<UID>>&status=<<status>>&pid=<<PID>>",
      ...(key === "redirects" ? { screenOuts: "https://supplier.example/screenout?survey=%%SURVEYID%%" } : {}),
    } : {}),
    ...(scenario === "link-invalid" ? { [key === "redirects" ? "completes" : "complete"]: "not-a-url" } : {}),
  };
  const initial = preview
    ? { inherited: scenario === "defaults", values: previewValues }
    : config.sections[key];
  const base = `/projects/${projectId}/subsamples/${subsampleId}/links`;
  const active =
    sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
      <nav
        aria-label="Links sections"
        className="space-y-1 border-b pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-5"
      >
        <h2 className="mb-3 text-sm font-semibold">Links</h2>
        {sections.map(({ id, label, Icon }) => (
          <Link
            aria-current={activeSection === id ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeSection === id && "bg-muted font-medium text-foreground",
            )}
            onClick={() => setScenario("")}
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
        <h2 id="configuration-section-title" className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {active.label}
        </h2>
        {activeSection === "entry-links" && scenario === "empty" ? <div className="mt-4"><ScenarioEmpty title="No links available" message="No values have been configured for this section." /></div> : <div className="mt-5 space-y-5">
          {activeSection === "entry-links" ? <EntryLinks subsample={subsample} /> : <LinkConfigurationForm
            key={`${activeSection}:${scenario}`}
            section={key}
            projectId={projectId}
            subsampleId={subsampleId}
            initial={initial}
            preview={preview}
          />}

        </div>}
      </section>
    </div>
  );
}
