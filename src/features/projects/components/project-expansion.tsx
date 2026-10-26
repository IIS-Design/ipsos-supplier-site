import type { Subsample } from "@/types/subsample";
import { SubsampleSummary } from "./subsample-summary";

export function ProjectExpansion({ subsamples, wholeRowLink = false }: { subsamples: Subsample[]; wholeRowLink?: boolean }) {
  if (subsamples.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        No subsamples match the selected filters.
      </p>
    );
  }

  return (
    <ul aria-label="Available subsamples" className="border-l border-border pl-4">
      {subsamples.map((subsample) => (
        <SubsampleSummary wholeRowLink={wholeRowLink} key={subsample.id} subsample={subsample} />
      ))}
    </ul>
  );
}
