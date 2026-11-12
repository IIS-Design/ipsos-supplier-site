"use client";

import { EntryLinks } from "./entry-links";
import type { Subsample } from "@/types/subsample";
import { Switch } from "@/components/ui/switch";
import { useConfigurationState, type ConfigKey } from "./configuration-state";
import { redirectFields, endpointFields, fieldLabels } from "@/features/settings/settings-model";
import { usePrototypeState } from "@/components/prototype-state";
import { ScenarioEmpty } from "./scenario-preview";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const inherited = scenario === "defaults" ? true : scenario === "custom" ? false : config.sections[key].inherited;
  const values = inherited ? config.defaults[key] : config.sections[key].values;
  const edit = (field: string, value: string) => {
    config.toggle(key, false);
    config.edit(key, field, value);
    setScenario("");
  };
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
          {activeSection === "entry-links" ? <EntryLinks subsample={subsample} /> : <>
            <div className="flex flex-wrap items-center gap-3"><label className="text-sm font-medium" htmlFor={`inherit-${key}`}>Use Supplier Defaults</label><Switch id={`inherit-${key}`} checked={inherited} onCheckedChange={checked => { setScenario(""); config.toggle(key, checked); }} /><Badge variant="outline">{inherited ? "Inherited" : "Custom Override"}</Badge></div>
            {activeSection === "server-to-server" && <label className="block space-y-2 text-sm font-medium">Pixel HTML<textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm font-normal read-only:bg-muted/40" readOnly={inherited} value={values.pixel ?? ""} onChange={event => edit("pixel", event.target.value)} placeholder="Insert your code here…" /></label>}
            {(activeSection === "redirects" ? [...redirectFields] : [...endpointFields]).map(field => <label key={field} className="block space-y-2 text-sm font-medium">{fieldLabels[field]}<Input readOnly={inherited} className="read-only:bg-muted/40" value={values[field] ?? ""} onChange={event => edit(field, event.target.value)} /></label>)}
          </>}

        </div>}
      </section>
    </div>
  );
}
