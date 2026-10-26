import fixtures from "@/data/reports.json";
import type { ReportId } from "@/types/ids";

type SequenceState = typeof globalThis & { __ipsosReportSequences?: Record<number, number> };
const state = globalThis as SequenceState;
const sequences = (state.__ipsosReportSequences ??= {});

/** Synchronous reservation matches the process-local report repository lifecycle. */
export function nextReportId(date = new Date()): ReportId {
  const year = date.getFullYear();
  const prefix = `RPT-${year}-`;
  const seed = Math.max(0, ...fixtures.filter(report => report.id.startsWith(prefix)).map(report => Number(report.id.slice(prefix.length)) || 0));
  const next = Math.max(sequences[year] ?? 0, seed) + 1;
  sequences[year] = next;
  return `${prefix}${String(next).padStart(4, "0")}` as ReportId;
}
