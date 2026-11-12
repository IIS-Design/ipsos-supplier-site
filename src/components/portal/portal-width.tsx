"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Expand, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const WidthContext = createContext<{ wide: boolean; toggle: () => void } | null>(null);

const widthStorageKey = "ipsos-supplier-portal:full-width";
const widthChangeEvent = "portal-width-change";
let memoryWidth = false;
let memoryOnly = false;

function readWidth() {
  if (memoryOnly) return memoryWidth;
  try { return window.localStorage.getItem(widthStorageKey) === "true"; }
  catch { return memoryWidth; }
}
function subscribeWidth(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === widthStorageKey || event.key === null) onChange();
  };
  window.addEventListener(widthChangeEvent, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(widthChangeEvent, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
function toggleWidth() {
  memoryWidth = !readWidth();
  try { window.localStorage.setItem(widthStorageKey, String(memoryWidth)); }
  catch { memoryOnly = true; }
  window.dispatchEvent(new Event(widthChangeEvent));
}

export function PortalWidthProvider({ children }: { children: ReactNode }) {
  const wide = useSyncExternalStore(subscribeWidth, readWidth, () => false);
  return <WidthContext.Provider value={{ wide, toggle: toggleWidth }}>
    <div className="contents" style={{ "--portal-max-width": wide ? "100%" : "75rem" } as React.CSSProperties}>{children}</div>
  </WidthContext.Provider>;
}

export function PortalWidthToggle() {
  const context = useContext(WidthContext);
  if (!context) return null;
  const Icon = context.wide ? Minimize2 : Expand;
  const label = context.wide ? "Restore standard width" : "Use full width";
  return <Button type="button" size="sm" variant="ghost" className="size-8 shrink-0 px-0" onClick={context.toggle} aria-label={label} title={label} aria-pressed={context.wide}>
    <Icon aria-hidden="true" className="size-4" />
  </Button>;
}
