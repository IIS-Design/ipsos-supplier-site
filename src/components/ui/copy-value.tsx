"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Tooltip } from "radix-ui";
import { Button } from "./button";

export function CopyValue({ value, label }: { value: string; label: string }) {
  const [feedback, setFeedback] = useState<"copied" | "error" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);
  const copy = async () => {
    let result: "copied" | "error";
    try { await navigator.clipboard.writeText(value); result = "copied"; }
    catch { result = "error"; }
    if (!mounted.current) return;
    if (timer.current) clearTimeout(timer.current);
    setFeedback(result);
    timer.current = setTimeout(() => setFeedback(null), 3000);
  };
  const message = feedback === "copied" ? "Copied to clipboard" : feedback === "error" ? "Unable to copy. Select and copy the value manually." : "";
  return <Tooltip.Provider delayDuration={0}>
    <Tooltip.Root open={feedback !== null}>
      <Tooltip.Trigger asChild>
        <Button type="button" variant="ghost" size="sm" className="size-7 shrink-0 px-0" aria-label={`Copy ${label}`} onClick={copy}>
          {feedback === "copied" ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="top" sideOffset={6} collisionPadding={12} className="z-90 max-w-64 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 motion-reduce:animate-none">
          {message || "Copied to clipboard"}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
    <span role="status" className="sr-only">{message}</span>
  </Tooltip.Provider>;
}
