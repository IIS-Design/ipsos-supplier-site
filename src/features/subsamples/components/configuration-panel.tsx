"use client";

import { usePrototypeState } from "@/components/prototype-state";
import { ScenarioEmpty } from "./scenario-preview";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const { scenario } = usePrototypeState();
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
        <h2 id="configuration-section-title" className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {active.label}
        </h2>
        {scenario === "empty" ? <div className="mt-4"><ScenarioEmpty title="No configuration available" message="No values have been configured for this section." /></div> : <div className="mt-5 space-y-5">
          <Badge variant="outline">{scenario === "custom" || (scenario === "overrides" && activeSection === "redirects") ? "Custom configuration" : "Using supplier defaults"}</Badge>
          {activeSection === "entry-links" ? <div className="space-y-2"><h3 className="text-sm font-medium">Entry Link</h3><p className="break-all text-sm text-muted-foreground">https://survey.example.test/entry?subsample={subsampleId}{scenario === "custom" ? "&configuration=custom" : ""}</p></div> : activeSection === "security" ? <p className="rounded-md border p-4 text-sm text-muted-foreground">No security rules defined</p> : <>
            {activeSection === "server-to-server" && <label className="block space-y-2 text-sm font-medium">Pixel HTML<textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm font-normal" readOnly value="" placeholder="Insert your code here…" /></label>}
            {(activeSection === "redirects" ? ["Completes", "Screen Outs", "Quota Full / Survey Closed", "Sniff Out", "Long Term Redirect", "Suspicious / Unengaged", "Platform (mobile or not) Redirect", "Security Redirect"] : ["Complete", "Termination", "Quota Full", "Server Load", "Sniff Out", "Fraud", "Opt Out"]).map((label, index) => <label key={label} className="block space-y-2 text-sm font-medium">{label}<Input readOnly value={`https://survey.example.test/${scenario === "custom" || (scenario === "overrides" && activeSection === "redirects") ? "custom" : "default"}/outcome-${index + 1}`} /></label>)}
          </>}
        </div>}
      </section>
    </div>
  );
}
