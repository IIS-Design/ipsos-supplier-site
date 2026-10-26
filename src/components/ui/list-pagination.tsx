"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ListPagination({ total, noun, page, pageSize, onPageChange, onPageSizeChange }: {
  total: number; noun: string; page: number; pageSize: number;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void;
}) {
  const id = useId();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (!total) return null;
  return <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
    <p aria-live="polite" className="text-sm text-muted-foreground">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} {noun}</p>
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-muted-foreground" htmlFor={id}>Items per page</label>
      <Select onValueChange={(value) => onPageSizeChange(Number(value))} value={String(pageSize)}>
        <SelectTrigger className="w-20" id={id} aria-label="Items per page"><SelectValue /></SelectTrigger>
        <SelectContent>{[10, 20, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
      </Select>
      <nav aria-label={`${noun} pagination`} className="flex items-center gap-2">
        <Button disabled={page === 1} onClick={() => onPageChange(page - 1)} size="sm" type="button" variant="outline">Previous</Button>
        <span className="text-sm tabular-nums" aria-live="polite">Page {page} of {pageCount}</span>
        <Button disabled={page === pageCount} onClick={() => onPageChange(page + 1)} size="sm" type="button" variant="outline">Next</Button>
      </nav>
    </div>
  </div>;
}
