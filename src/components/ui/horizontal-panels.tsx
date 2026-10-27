"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PanelContext = createContext<{
  expanded: boolean;
  toggle: () => void;
  panelId: string;
  label: string;
  breakpoint: "lg" | "xl";
  side: "left" | "right";
} | null>(null);

/** Keep the zero-width track occupied so grid auto-placement cannot shrink content. */
export function HorizontalPanels({ children, panel, side, label, breakpoint = "lg" }: {
  children: ReactNode;
  panel: ReactNode;
  side: "left" | "right";
  label: string;
  breakpoint?: "lg" | "xl";
}) {
  const [expanded, setExpanded] = useState(true);
  const panelId = useId();
  const left = side === "left";
  const columns = breakpoint === "lg"
    ? expanded ? "lg:grid-cols-[320px_minmax(0,1fr)]" : "lg:grid-cols-[0px_minmax(0,1fr)] lg:gap-0"
    : expanded ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "xl:grid-cols-[minmax(0,1fr)_0px] xl:gap-0";
  const panelNode = <div id={panelId} className={cn("min-w-0", breakpoint === "lg" ? "lg:overflow-hidden" : "xl:overflow-hidden", !expanded && (breakpoint === "lg" ? "lg:invisible lg:pointer-events-none" : "xl:invisible xl:pointer-events-none"))}>
    <div className={breakpoint === "lg" ? "lg:w-80" : "xl:w-[340px]"}>{panel}</div>
  </div>;
  return <PanelContext.Provider value={{ expanded, toggle: () => setExpanded(value => !value), panelId, label, breakpoint, side }}>
    <div data-panel-state={expanded ? "expanded" : "collapsed"} className={cn("grid items-start gap-6 transition-[grid-template-columns,column-gap] duration-200 motion-reduce:transition-none", columns)}>
      {left && panelNode}
      <div className={cn("min-w-0", left ? "lg:col-start-2" : "xl:col-start-1")}>{children}</div>
      {!left && panelNode}
    </div>
  </PanelContext.Provider>;
}

export function HorizontalPanelTrigger({ className }: { className?: string }) {
  const context = useContext(PanelContext);
  if (!context) return null;
  const Icon = context.side === "left"
    ? context.expanded ? PanelLeftClose : PanelLeftOpen
    : context.expanded ? PanelRightClose : PanelRightOpen;
  return <Button aria-label={`${context.expanded ? "Collapse" : "Expand"} ${context.label} panel`} aria-expanded={context.expanded} aria-controls={context.panelId} onClick={context.toggle} size="sm" type="button" variant="ghost" className={cn("hidden size-8 shrink-0 px-0", context.breakpoint === "lg" ? "lg:inline-flex" : "xl:inline-flex", className)}><Icon aria-hidden="true" className="size-4" /></Button>;
}

export function HorizontalPanelContent({ children }: { children: ReactNode }) {
  const context = useContext(PanelContext);
  return <div className={cn("min-w-0 transition-[padding] duration-200 motion-reduce:transition-none", context?.expanded && "lg:border-l lg:pl-6")}>{children}</div>;
}
