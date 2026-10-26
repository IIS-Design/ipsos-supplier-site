import type { Subsample } from "@/types/subsample";
export type SubsampleListFilters = { query: string; status: string; language: string; router: string; from: string; to: string };
export function filterSubsamples(subsamples: Subsample[], filters: SubsampleListFilters) {
  const query = filters.query.trim().toLowerCase();
  return subsamples.filter(item => (!query || `${item.name} ${item.id}`.toLowerCase().includes(query))
    && (filters.status === "all" || item.status === filters.status)
    && (filters.language === "all" || item.language === filters.language)
    && (filters.router === "all" || (filters.router === "unassigned" ? !item.router : item.router === filters.router))
    && (!filters.from || item.fieldEndDate >= filters.from)
    && (!filters.to || item.fieldEndDate <= filters.to));
}
