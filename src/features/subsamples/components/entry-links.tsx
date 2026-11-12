"use client";

import { usePrototypeState } from "@/components/prototype-state";
import { CopyValue } from "@/components/ui/copy-value";
import type { Subsample } from "@/types/subsample";

export function EntryLinks({ subsample }: { subsample: Subsample }) {
  const { scenario } = usePrototypeState();
  let links = subsample.entryLinks ?? [];
  if (scenario.startsWith("links-")) {
    const languages = scenario === "links-multiple" || scenario === "links-partial" ? ["en-CA", "fr-CA"] : ["en-CA"];
    links = languages.map(language => ({ language,
      live: scenario === "links-no-live" ? undefined : `https://survey.example.test/entry?subsample=${subsample.id}&language=${language}${scenario === "links-long" ? `&token=${"example-token-".repeat(20)}` : ""}`,
      testing: scenario === "links-partial" ? undefined : `https://survey.example.test/proof?subsample=${subsample.id}&language=${language}`,
    }));
  }
  if (!links.length) return <p className="text-sm text-muted-foreground">No entry links are available for this subsample.</p>;
  return <div className="space-y-6">{links.map(group => <section key={group.language} className="space-y-3 border-t pt-4">
    <h3 className="text-sm font-semibold">{group.language}</h3>
    {([ ["Live", group.live], ["Testing / Proofing", group.testing] ] as const).map(([label, url]) => <div key={label} className="space-y-1">
      <h4 className="text-sm font-medium">{label}</h4>
      {url ? <div className="flex items-start gap-2"><p className="min-w-0 flex-1 break-all text-sm text-muted-foreground">{url}</p><CopyValue value={url} label={`${group.language} ${label} link`} /></div> : <p className="text-sm text-muted-foreground">Not available</p>}
    </div>)}
  </section>)}</div>;
}
