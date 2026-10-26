"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ActivityModule = "Reports" | "Costs";
type ActivityEmpty = Record<ActivityModule, boolean>;
type PrototypeState = {
  empty: boolean;
  setEmpty: (empty: boolean) => void;
  activityEmpty: ActivityEmpty;
  setActivityEmpty: (module: ActivityModule, empty: boolean) => void;
};
const PrototypeContext = createContext<PrototypeState>({ empty: false, setEmpty: () => {}, activityEmpty: { Reports: false, Costs: false }, setActivityEmpty: () => {} });

/** Page-scoped preview state. No storage, requests or fixture mutations. */
export function PrototypeStateProvider({ children }: { children: ReactNode }) {
  const [empty, setEmpty] = useState(false);
  const [activityEmpty, setActivity] = useState<ActivityEmpty>({ Reports: false, Costs: false });
  const setActivityEmpty = (module: ActivityModule, empty: boolean) => setActivity(current => ({ ...current, [module]: empty }));
  return <PrototypeContext.Provider value={{ empty, setEmpty, activityEmpty, setActivityEmpty }}>{children}</PrototypeContext.Provider>;
}

export function usePrototypeState() { return useContext(PrototypeContext); }

export function PrototypeEmptyNotice({ module }: { module: "Reports" | "Costs" }) {
  const { empty, setEmpty } = usePrototypeState();
  if (!empty) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted p-3" role="status">
      <p className="text-sm">Empty {module.toLowerCase()} preview</p>
      <Button onClick={() => setEmpty(false)} size="sm" type="button" variant="outline">Restore {module}</Button>
    </div>
  );
}

/** Only swaps the matching Projects Activity panel, keeping the Project list intact. */
export function PrototypeActivityPreview({ module, children, emptyContent }: { module: ActivityModule; children: ReactNode; emptyContent: ReactNode }) {
  const { activityEmpty } = usePrototypeState();
  return activityEmpty[module] ? emptyContent : children;
}
