"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./horizontal-panels.module.css";
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
export function HorizontalPanels({ children, panel, side, label, breakpoint = "lg", resizable = false }: {
  children: ReactNode;
  panel: ReactNode;
  side: "left" | "right";
  label: string;
  breakpoint?: "lg" | "xl";
  resizable?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartWidth = useRef(340);
  const [panelWidth, setPanelWidth] = useState(340);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [dragging, setDragging] = useState(false);
  const adjustable = resizable && side === "right" && breakpoint === "xl";
  useEffect(() => {
    if (!adjustable || !containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [adjustable]);
  const maxPanelWidth = Math.max(280, Math.min(containerWidth * 0.55, containerWidth - 384));
  const visiblePanelWidth = Math.round(Math.min(panelWidth, maxPanelWidth));
  const resizePanel = (width: number) => {
    const available = containerRef.current?.getBoundingClientRect().width ?? 1000;
    setPanelWidth(Math.round(Math.min(Math.max(280, width), Math.max(280, Math.min(available * 0.55, available - 384)))));
  };
  const left = side === "left";
  const columns = breakpoint === "lg"
    ? expanded ? "lg:grid-cols-[320px_minmax(0,1fr)]" : "lg:grid-cols-[0px_minmax(0,1fr)] lg:gap-0"
    : expanded ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "xl:grid-cols-[minmax(0,1fr)_0px] xl:gap-0";
  const panelNode = <div id={panelId} className={cn("min-w-0", breakpoint === "lg" ? "lg:overflow-hidden" : "xl:overflow-hidden", !expanded && (breakpoint === "lg" ? "lg:invisible lg:pointer-events-none" : "xl:invisible xl:pointer-events-none"))}>
    <div className={adjustable ? "w-full" : breakpoint === "lg" ? "lg:w-80" : "xl:w-[340px]"}>{panel}</div>
  </div>;
  return <PanelContext.Provider value={{ expanded, toggle: () => setExpanded(value => !value), panelId, label, breakpoint, side }}>
    <div ref={containerRef} data-resizable-panels={adjustable ? "" : undefined} style={adjustable ? { "--panel-width": `${visiblePanelWidth}px` } as CSSProperties : undefined} data-dragging={dragging || undefined} data-panel-state={expanded ? "expanded" : "collapsed"} className={cn("grid items-start gap-6 transition-[grid-template-columns,column-gap] duration-200 motion-reduce:transition-none", adjustable ? styles.panels : columns)}>
      {left && panelNode}
      <div className={cn("min-w-0", left ? "lg:col-start-2" : "xl:col-start-1")}>{children}</div>
      {adjustable && <div
        role="separator"
        tabIndex={expanded ? 0 : -1}
        aria-label={`Resize ${label} panel`}
        aria-orientation="vertical"
        aria-controls={panelId}
        aria-valuemin={280}
        aria-valuemax={Math.round(maxPanelWidth)}
        aria-valuenow={visiblePanelWidth}
        aria-valuetext={`${visiblePanelWidth} pixels`}
        className={styles.divider}
        onPointerDown={event => {
          if (event.button !== 0) return;
          event.preventDefault();
          dragStartWidth.current = visiblePanelWidth;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={event => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const bounds = containerRef.current?.getBoundingClientRect();
          if (!bounds) return;
          if (event.clientX >= bounds.right - 24) {
            event.currentTarget.releasePointerCapture(event.pointerId);
            setDragging(false);
            setPanelWidth(dragStartWidth.current);
            setExpanded(false);
            return;
          }
          resizePanel(bounds.right - event.clientX - 12);
        }}
        onPointerUp={event => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          setDragging(false);
        }}
        onLostPointerCapture={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => setPanelWidth(340)}
        onKeyDown={event => {
          const delta = event.shiftKey ? 40 : 16;
          if (event.key === "ArrowLeft") resizePanel(visiblePanelWidth + delta);
          else if (event.key === "ArrowRight") resizePanel(visiblePanelWidth - delta);
          else if (event.key === "Home") resizePanel(280);
          else if (event.key === "End") resizePanel(Number.MAX_SAFE_INTEGER);
          else return;
          event.preventDefault();
        }}
      />}
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
