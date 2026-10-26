"use client";

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const desktopQuery = "(min-width: 1280px)";
const subscribeDesktop = (notify: () => void) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const getDesktopSnapshot = () => window.matchMedia(desktopQuery).matches;
const getServerSnapshot = () => false;

type ActivityContent = { reports: ReactNode; costs: ReactNode };

export function ProjectsWorkspace({ children, reports, costs }: ActivityContent & { children: ReactNode }) {
  const [desktopExpanded, setExpanded] = useState(true);
  const desktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getServerSnapshot);
  const expanded = !desktop || desktopExpanded;
  return (
    <div className={cn(
      "grid items-start gap-6 transition-[grid-template-columns] duration-200 motion-reduce:transition-none",
      expanded ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "xl:grid-cols-[minmax(0,1fr)_48px]",
    )}>
      {children}
      <ActivityPanel reports={reports} costs={costs} expanded={expanded} onToggle={() => setExpanded((current) => !current)} />
    </div>
  );
}

export function ActivityPanel({ reports, costs, expanded, onToggle }: ActivityContent & {
  expanded: boolean;
  onToggle: () => void;
}) {
  const [view, setView] = useState("costs");
  const contentId = useId();

  return (
    <aside aria-label="Activity" data-state={expanded ? "expanded" : "collapsed"} className={cn(
      "min-w-0 overflow-hidden rounded-lg border bg-card transition-[width] duration-200 motion-reduce:transition-none",
      expanded ? "w-full" : "w-12",
    )}>
      <Tabs className="gap-0" value={view} onValueChange={setView}>
        <div className={cn("flex min-h-14 items-center gap-2", expanded ? "px-3" : "justify-center")}>
          <Button
            aria-label={expanded ? "Collapse Activity panel" : "Expand Activity panel"}
            aria-controls={contentId}
            aria-expanded={expanded}
            className="hidden size-8 shrink-0 px-0 xl:inline-flex"
            onClick={onToggle}
            size="sm"
            title="Toggle Activity sidebar"
            type="button"
            variant="ghost"
          >
            <PanelLeft aria-hidden="true" className="size-4" />
          </Button>
          <TabsList variant="line" aria-label="Activity panels" className={cn("m-0 flex-1 justify-start gap-4 border-b", !expanded && "hidden")}>
            <TabsTrigger className="flex-none px-0" value="costs">Costs</TabsTrigger>
            <TabsTrigger className="flex-none px-0" value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>
        <div
          aria-hidden={!expanded}
          className={expanded ? "min-w-0" : "invisible w-[338px]"}
          inert={!expanded}
          id={contentId}
        >
          <TabsContent className="m-0" value="reports">{reports}</TabsContent>
          <TabsContent className="m-0" value="costs">{costs}</TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
