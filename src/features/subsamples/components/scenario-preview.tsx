"use client";

import { Button } from "@/components/ui/button";
import { usePrototypeState } from "@/components/prototype-state";

export function ScenarioEmpty({ title, message }: { title: string; message: string }) {
  const { setScenario } = usePrototypeState();
  return <section className="rounded-md border p-6 text-center"><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{message}</p><Button className="mt-4" size="sm" variant="outline" onClick={() => setScenario("")}>Restore Current Data</Button></section>;
}
