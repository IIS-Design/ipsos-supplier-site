"use client";

import { useId } from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { integrationDescriptions, redirectFallbackNote } from "../integration-model";

export function IntegrationHelp({ section }: { section: "redirects" | "server-to-server" }) {
  const id = useId();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="size-9 shrink-0 px-0 text-muted-foreground" aria-label={`Help with ${section === "redirects" ? "redirect" : "server-to-server"} URL tokens`}>
          <CircleHelp aria-hidden="true" className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-labelledby={id} className="w-96 space-y-3 text-sm">
        <h3 id={id} className="font-medium">URL placeholders</h3>
        <p className="text-muted-foreground">Use placeholders to include session data in your URL. Values are filled in when the redirect or notification is sent.</p>
        <dl className="space-y-2">
          <div><dt className="font-mono">{ "<<UID>>" }</dt><dd className="text-muted-foreground">Cortex session ID.</dd></div>
          <div><dt className="font-mono">{ "<<status>>" }</dt><dd className="text-muted-foreground">Final status code.</dd></div>
          <div><dt className="font-mono">{ "<<PID>>" }</dt><dd className="text-muted-foreground">The PID supplied on the entry link.</dd></div>
          {section === "redirects" && <div><dt className="font-mono">%%SURVEYID%%</dt><dd className="text-muted-foreground">Most recent survey or subsample ID.</dd></div>}
        </dl>
        <p className="text-muted-foreground">{section === "redirects" ? "Double-percent placeholders only work in redirect URLs. Supported names: SURVEYID, USERID, TP, RP, TT and RT. They do not work in S2S." : "Use double-angle placeholders in S2S URLs. Double-percent placeholders only work in redirects."}</p>
        <p className="text-muted-foreground">Unknown or misspelled {"<<tokens>>"} are replaced with an empty value. Check spelling and capitalization.</p>
      </PopoverContent>
    </Popover>
  );
}

export function IntegrationIntro({ section }: { section: "redirects" | "server-to-server" }) {
  return <div className="space-y-2">
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm text-muted-foreground">{integrationDescriptions[section]}</p>
      <IntegrationHelp section={section} />
    </div>
    {section === "redirects" && <p className="text-xs text-muted-foreground">{redirectFallbackNote}</p>}
  </div>;
}
