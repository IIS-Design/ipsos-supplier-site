"use client";

import { Suspense, useId, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { PrototypeStateProvider, usePrototypeState } from "@/components/prototype-state";
import { confirmContactNavigation } from "@/features/contacts/use-unsaved-changes";
import { scenarioTab, subsampleScenarios } from "@/features/subsamples/scenarios";
import { withBasePath } from "@/lib/app-path";

export function PrototypeEnvironment({ children }: { children: ReactNode }) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  return <PrototypeStateProvider key={pathname}>{children}<Suspense fallback={null}><PrototypeTools /></Suspense></PrototypeStateProvider>;
}

export function FloatingPrototypeTools({
  title,
  children,
  defaultOpen = false,
  badgeCount,
  availabilityKey,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badgeCount?: number;
  availabilityKey?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const initialAutoOpen = useRef(defaultOpen);
  const titleId = useId();
  const countId = useId();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Prototype Tools"
          aria-describedby={badgeCount ? countId : undefined}
          className="fixed bottom-3 right-3 z-40 inline-flex min-h-9 items-center gap-1.5 rounded-md bg-background/90 px-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          {badgeCount ? (
            <span
              aria-hidden="true"
              className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1.5 font-semibold text-white tabular-nums"
              key={availabilityKey ?? badgeCount}
            >
              <span className="prototype-tool-notification-text">{badgeCount}</span>
            </span>
          ) : null}
          <Wrench aria-hidden="true" className="size-3.5" />
          <span>Prototype Tools</span>
          <span className="sr-only" id={countId} role="status" aria-live="polite" aria-atomic="true">
            {badgeCount ? `${badgeCount} available prototype ${badgeCount === 1 ? "action" : "actions"}` : ""}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-labelledby={titleId}
        className="max-h-[calc(100dvh-5rem)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto bg-card text-card-foreground"
        collisionPadding={16}
        onOpenAutoFocus={(event) => {
          // Automatic confirmation guidance must not steal focus from the page.
          if (initialAutoOpen.current) {
            event.preventDefault();
            initialAutoOpen.current = false;
          }
        }}
        side="top"
        sideOffset={12}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-sm font-semibold" id={titleId}>
            {title}
          </h2>
          <Button
            aria-label="Close prototype tools"
            className="-mr-2 -mt-2 size-8 shrink-0 px-0 text-muted-foreground"
            onClick={() => setOpen(false)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PrototypeTools() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const { scenario, setScenario, empty, setEmpty, activityEmpty, setActivityEmpty } = usePrototypeState();
  const confirmation = pathname === "/forgot-password/confirmation";
  const credentials = pathname === "/login";
  const resetWorkflow = confirmation || pathname === "/reset-password";
  const passwordUpdated = pathname === "/reset-password/success";
  const reports = pathname === "/reports" || pathname.startsWith("/reports/");
  const actions = resetWorkflow
    ? [{ href: withBasePath("/email-preview/reset-password/"), label: "Open Reset Password Email" }]
    : passwordUpdated
      ? [{ href: withBasePath("/email-preview/password-changed/"), label: "Open Password Changed Email" }]
      : reports
        ? [{ href: withBasePath("/mock-reports/RPT-2026-1045.csv"), label: "Open Sample Report" }]
        : [];
  const emptyModule = pathname === "/reports" ? "Reports" : pathname === "/costs" ? "Costs" : null;
  const projects = pathname === "/projects";
  const tab = scenarioTab(pathname);
  const section = useSearchParams().get("section") ?? "entry-links";
  const customLabel = section === "server-to-server" ? "Show Custom S2S" : section === "security" ? "Show Custom Security" : section === "redirects" ? "Show Custom Overrides" : "Show Custom Entry Link";
  const scenarios = tab === "configuration" ? [
    ["defaults", "Show Defaults", "Displays supplier configuration values."],
    ["custom", customLabel, section === "security" ? "Displays independent security configuration with no rules defined." : "Displays independent configuration values."],
    ["empty", "Show Empty State", "Displays this section without configured values."],
  ] : tab ? subsampleScenarios[tab] : [];
  const badgeCount = scenarios.length + (projects ? 2 : 0) + actions.length + (credentials ? 1 : 0) + (emptyModule ? 1 : 0);
  const availabilityKey = credentials ? "credentials" : actions.map(({ href }) => href).join(",") + (emptyModule ? `:${emptyModule}:${empty}` : "") + (projects ? `:activity:${activityEmpty.Reports}:${activityEmpty.Costs}` : "");
  if (!badgeCount) return null;

  return (
    <FloatingPrototypeTools
      availabilityKey={availabilityKey}
      badgeCount={badgeCount}
      defaultOpen={confirmation}
      key={pathname}
      title="Prototype Tools"
    >
      {tab && <section className="space-y-3"><h3 className="font-medium capitalize text-foreground">{tab.replaceAll("-", " ")}</h3>
        <Button className="w-full" variant="outline" size="sm" onClick={() => setScenario("")} disabled={!scenario}>Restore Current Data</Button>
        {scenarios.map(([id, label, description]) => <div key={id} className="space-y-1"><Button className="w-full justify-start" aria-pressed={scenario === id} variant="outline" size="sm" onClick={() => { if (tab !== "contacts" || confirmContactNavigation()) setScenario(id); }}>{label}</Button><p className="text-xs">{description}</p></div>)}
      </section>}
      {credentials ? (
        <section className="space-y-2">
          <h3 className="font-medium text-foreground">Valid Credentials</h3>
          <ul className="space-y-1"><li>admin@supplier.com</li><li>user@supplier.com</li></ul>
        </section>
      ) : null}
      {actions.length ? (
        <div className="space-y-2">
          {actions.map(({ href, label }) => (
            <Button asChild className="w-full justify-start" key={href} size="sm" variant="outline">
              <a href={href} target="_blank" rel="noopener noreferrer">
                {label}<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          ))}
        </div>
      ) : null}
      {projects ? (["Reports", "Costs"] as const).map(module => (
        <section className="space-y-2" key={module}>
          <h3 className="font-medium text-foreground">{module}</h3>
          <Button className="w-full justify-start" onClick={() => setActivityEmpty(module, !activityEmpty[module])} size="sm" type="button" variant="outline">
            {activityEmpty[module] ? `Restore ${module}` : `Show Empty ${module} State`}
          </Button>
        </section>
      )) : null}
      {emptyModule ? (
        <Button className="w-full justify-start" onClick={() => setEmpty(!empty)} size="sm" type="button" variant="outline">
          {empty ? `Restore ${emptyModule}` : `Show Empty ${emptyModule} State`}
        </Button>
      ) : null}
    </FloatingPrototypeTools>
  );
}
