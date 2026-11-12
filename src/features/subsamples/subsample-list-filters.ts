import { subsampleLanguages } from "@/types/subsample";
import type { Subsample } from "@/types/subsample";
export type SubsampleListFilters = { query: string; status: string | string[]; language: string | string[]; router: string | string[]; from: string; to: string };
function selected(filter: string | string[], value: string) {
  return Array.isArray(filter) ? !filter.length || filter.includes(value) : filter === "all" || filter === value;
}
export function filterSubsamples(subsamples: Subsample[], filters: SubsampleListFilters) {
  const query = filters.query.trim().toLowerCase();
  return subsamples.filter(item => (!query || `${item.name} ${item.id}`.toLowerCase().includes(query))
    && selected(filters.status, item.status)
    && subsampleLanguages(item).some(value => selected(filters.language, value))
    && selected(filters.router, item.router || "unassigned")
    && (!filters.from || item.fieldEndDate >= filters.from)
    && (!filters.to || item.fieldEndDate <= filters.to));
}
