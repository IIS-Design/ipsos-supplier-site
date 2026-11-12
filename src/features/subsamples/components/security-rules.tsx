"use client";

import { useState } from "react";
import { usePrototypeState } from "@/components/prototype-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** Read-only reference preview; full criteria catalogue and real rules await Product validation. */
export function SecurityRules() {
  const { scenario } = usePrototypeState();
  const [expansion, setExpansion] = useState<{ scenario: string; ids: string[] }>({ scenario: "", ids: [] });
  const expanded = expansion.scenario === scenario ? expansion.ids : [];
  const setExpanded = (next: string[] | ((current: string[]) => string[])) => setExpansion(current => ({ scenario, ids: typeof next === "function" ? next(current.scenario === scenario ? current.ids : []) : next }));
  const hasRules = scenario === "security-rules" || scenario === "security-many";
  const rules = Array.from({ length: scenario === "security-many" ? 6 : 1 }, (_, index) => ({ id: `rule-${index}`, name: `Research Type × Client${index ? ` — ${index + 1}` : ""}` }));
  const statuses = ["In survey (2)", "Screened out (82)", "Complete (3)", "Erroneous complete (98)", "Potentially unengaged (99)"];
  return <section aria-labelledby="security-heading" className="space-y-5">
    <h2 id="security-heading" className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Security Rules</h2>
    {!hasRules ? <p className="text-sm text-muted-foreground">No security rules have been configured for this subsample.</p> : <>
      <div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => setExpanded(rules.map(rule => rule.id))}>Expand all</Button><Button size="sm" variant="ghost" onClick={() => setExpanded([])}>Collapse all</Button></div>
      {rules.map(rule => <details key={`${scenario}-${rule.id}`} className="rounded-md border px-4" open={expanded.includes(rule.id)} onToggle={event => {
        const open = event.currentTarget.open;
        setExpanded(current => open ? current.includes(rule.id) ? current : [...current, rule.id] : current.includes(rule.id) ? current.filter(id => id !== rule.id) : current);
      }}>
        <summary className="cursor-pointer py-4 text-sm font-medium">{rule.name}<span className="mt-1 block font-normal text-muted-foreground">Excludes respondents who previously participated in the research type and client combinations below.</span></summary>
        <div className="space-y-4 pb-4"><Table><caption className="sr-only">Research Type × Client criteria and timespan</caption><TableHeader><TableRow><TableHead scope="col">Research Type × Client Combinations</TableHead><TableHead scope="col">Timespan (Days)</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Fast facts × NESTLÉ</TableCell><TableCell>5</TableCell></TableRow><TableRow><TableCell>CreativeSpark × Nike</TableCell><TableCell>15</TableCell></TableRow></TableBody></Table>
          <p className="text-sm font-medium">With the following statuses:</p><div className="flex flex-wrap gap-2">{statuses.map(status => <Badge key={status} variant="secondary">{status}</Badge>)}</div>
        </div>
      </details>)}
    </>}
  </section>;
}
