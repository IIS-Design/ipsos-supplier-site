"use client";

import { useState, type ReactNode } from "react";
import { HorizontalPanels } from "@/components/ui/horizontal-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ActivityContent = { reports: ReactNode; costs: ReactNode };

export function ProjectsWorkspace({ children, reports, costs }: ActivityContent & { children: ReactNode }) {
  return <HorizontalPanels side="right" label="Activity" breakpoint="xl" panel={<ActivityPanel reports={reports} costs={costs} />}>{children}</HorizontalPanels>;
}

export function ActivityPanel({ reports, costs }: ActivityContent) {
  const [view, setView] = useState("costs");
  return (
    <aside aria-label="Activity" className="min-w-0 overflow-hidden rounded-lg border bg-card">
      <Tabs className="gap-0" value={view} onValueChange={setView}>
        <div className="flex min-h-14 items-center gap-2 px-3">
          <TabsList variant="line" aria-label="Activity panels" className="m-0 flex-1 justify-start gap-4 border-b">
            <TabsTrigger className="flex-none px-0" value="costs">Costs</TabsTrigger>
            <TabsTrigger className="flex-none px-0" value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-w-0">
          <TabsContent className="m-0" value="reports">{reports}</TabsContent>
          <TabsContent className="m-0" value="costs">{costs}</TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
