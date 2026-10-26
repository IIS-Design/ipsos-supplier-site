import type { Subsample } from "@/types/subsample";

export type StatusFilter = "any" | Subsample["status"];
export type RemainingFilter = "any" | "zero" | "1-50" | "51-200" | "200+";

/** Remaining is the total of exclusive and shared capacity; buckets do not overlap. */
export function matchesAdvancedFilters(subsample: Pick<Subsample, "status" | "exclusiveRemaining" | "sharedRemaining">, status: StatusFilter, range: RemainingFilter): boolean {
  if (status !== "any" && subsample.status !== status) return false;
  const remaining = subsample.exclusiveRemaining + subsample.sharedRemaining;
  switch (range) {
    case "zero": return remaining === 0;
    case "1-50": return remaining >= 1 && remaining <= 50;
    case "51-200": return remaining >= 51 && remaining <= 200;
    case "200+": return remaining > 200;
    default: return true;
  }
}
