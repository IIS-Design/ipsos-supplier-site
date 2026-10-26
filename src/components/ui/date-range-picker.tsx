"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formControlStyles } from "@/components/ui/form-control";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DateRange = { from: string; to: string };
const asDate = (value: string) => new Date(`${value}T12:00:00`);
const asValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const firstOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1, 12);
const shortDate = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(asDate(value));

export function DateRangePicker({ value, onChange, label = "Date range" }: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [preset, setPreset] = useState<{ label: string; from: string; to: string } | null>(null);
  const [draft, setDraft] = useState(value);
  const [month, setMonth] = useState(() => firstOfMonth(value.from ? asDate(value.from) : new Date()));
  const [focused, setFocused] = useState(() => value.from || asValue(new Date()));
  const id = useId();
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month);
  const offset = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = asValue(new Date());
  const hasRange = Boolean(value.from || value.to);
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(currentYear - 100, month.getFullYear());
  const lastYear = Math.max(currentYear + 20, month.getFullYear());
  const changeMonth = (year: number, index: number) => {
    const next = new Date(year, index, 1, 12);
    setMonth(next);
    setFocused(asValue(next));
  };
  const clearDates = () => { onChange({ from: "", to: "" }); setPreset(null); setOpen(false); };

  const moveMonth = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1, 12);
    setMonth(next);
    setFocused(asValue(next));
  };
  const selectDate = (date: string) => {
    if (!draft.from || draft.to) setDraft({ from: date, to: "" });
    else setDraft(date < draft.from ? { from: date, to: draft.from } : { from: draft.from, to: date });
  };
  const navigateDate = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    const next = asDate(date);
    const delta: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in delta) next.setDate(next.getDate() + delta[event.key]);
    else if (event.key === "Home") next.setDate(next.getDate() - next.getDay());
    else if (event.key === "End") next.setDate(next.getDate() + 6 - next.getDay());
    else return;
    event.preventDefault();
    const nextValue = asValue(next);
    setFocused(nextValue);
    setMonth(firstOfMonth(next));
    requestAnimationFrame(() => document.getElementById(`${id}-${nextValue}`)?.focus());
  };

  return (
    <Popover open={open} onOpenChange={(next) => {
      if (next) {
        setCustom(false);
        setDraft(value);
        const start = value.from ? asDate(value.from) : new Date();
        setMonth(firstOfMonth(start));
        setFocused(asValue(start));
      }
      setOpen(next);
    }}>
      <PopoverTrigger asChild>
        <Button aria-label={`${label}${value.from ? `: ${shortDate(value.from)}${value.to ? ` – ${shortDate(value.to)}` : " onward"}` : ": All dates"}`} className={cn(formControlStyles, "w-full min-w-0 justify-between gap-2 font-normal")} type="button" variant="outline">
          <span className="truncate">{preset && preset.from === value.from && preset.to === value.to ? preset.label : value.from ? `${shortDate(value.from)}${value.to ? ` – ${shortDate(value.to)}` : " onward"}` : "Date Range"}</span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label={label} className="w-80 p-3" onOpenAutoFocus={(event) => {
        if (custom) {
          event.preventDefault();
          document.getElementById(`${id}-${focused}`)?.focus();
        }
      }}>
        {!custom ? (
          <div className="flex flex-col gap-1" aria-label="Date range presets">
            {["Last Month", "Last 3 Months", "Last 6 Months", "Last 12 Months", "This Year"].map((name, index) => (
              <Button className="justify-start font-normal" id={`${id}-preset-${index}`} key={name} type="button" variant="ghost" onClick={() => {
                const now = new Date();
                const months = [1, 3, 6, 12][index];
                const from = index === 4 ? new Date(now.getFullYear(), 0, 1, 12) : new Date(now.getFullYear(), now.getMonth() - months, 1, 12);
                const to = index === 4 ? now : new Date(now.getFullYear(), now.getMonth(), 0, 12);
                const range = { from: asValue(from), to: asValue(to) };
                setPreset({ label: name, ...range });
                onChange(range);
                setOpen(false);
              }}>{name}</Button>
            ))}
            <Button className="justify-start font-normal" type="button" variant="ghost" onClick={() => {
              setCustom(true);
              requestAnimationFrame(() => document.getElementById(`${id}-${focused}`)?.focus());
            }}><CalendarDays aria-hidden="true" className="size-4" />Custom Range</Button>
            {hasRange ? <><Separator className="my-1" /><Button className="justify-start font-normal" type="button" variant="ghost" onClick={clearDates}>Clear Dates</Button></> : null}
          </div>
        ) : <>
        <Button className="mb-2 px-1" size="sm" type="button" variant="ghost" onClick={() => { setCustom(false); requestAnimationFrame(() => document.getElementById(`${id}-preset-0`)?.focus()); }}><ChevronLeft aria-hidden="true" className="size-4" />Presets</Button>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button aria-label="Previous month" className="size-8 px-0" onClick={() => moveMonth(-1)} size="sm" type="button" variant="ghost"><ChevronLeft aria-hidden="true" className="size-4" /></Button>
          <span className="sr-only" id={`${id}-month`} aria-live="polite">{monthLabel}</span>
          <div className="flex min-w-0 flex-1 gap-1">
            <Select value={String(month.getMonth())} onValueChange={(value) => changeMonth(month.getFullYear(), Number(value))}>
              <SelectTrigger aria-label="Calendar month" className="h-8 flex-1 px-2"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: 12 }, (_, index) => <SelectItem key={index} value={String(index)}>{new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2026, index, 1))}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(month.getFullYear())} onValueChange={(value) => changeMonth(Number(value), month.getMonth())}>
              <SelectTrigger aria-label="Calendar year" className="h-8 w-20 px-2"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: lastYear - firstYear + 1 }, (_, index) => <SelectItem key={index} value={String(firstYear + index)}>{firstYear + index}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button aria-label="Next month" className="size-8 px-0" onClick={() => moveMonth(1)} size="sm" type="button" variant="ghost"><ChevronRight aria-hidden="true" className="size-4" /></Button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground" id={`${id}-instructions`}>Select a start date, then an end date.</p>
        <table aria-labelledby={`${id}-month`} aria-describedby={`${id}-instructions`} className="w-full table-fixed border-collapse" role="grid" aria-multiselectable="true">
          <thead><tr>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => <th className="h-8 text-xs font-normal text-muted-foreground" key={day} scope="col" aria-label={day}>{day.slice(0, 2)}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: Math.ceil((offset + days) / 7) }, (_, week) => (
              <tr key={week}>
                {Array.from({ length: 7 }, (_, day) => {
                  const number = week * 7 + day - offset + 1;
                  if (number < 1 || number > days) return <td key={day} />;
                  const date = asValue(new Date(month.getFullYear(), month.getMonth(), number, 12));
                  const endpoint = date === draft.from || date === draft.to;
                  const within = Boolean(draft.from && draft.to && date > draft.from && date < draft.to);
                  return (
                    <td aria-selected={endpoint || within} className={cn("p-0.5", within && "bg-accent")} key={day}>
                      <button
                        aria-current={date === today ? "date" : undefined}
                        aria-label={new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(asDate(date))}
                        className={cn("flex h-9 w-full items-center justify-center rounded-md text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", date === today && "font-semibold", endpoint && "bg-primary text-primary-foreground hover:bg-primary/90")}
                        id={`${id}-${date}`}
                        onClick={() => selectDate(date)}
                        onFocus={() => setFocused(date)}
                        onKeyDown={(event) => navigateDate(event, date)}
                        tabIndex={focused === date ? 0 : -1}
                        type="button"
                      >{number}</button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 min-h-8 text-xs text-muted-foreground" role="status">
          {draft.from ? `${shortDate(draft.from)}${draft.to ? ` – ${shortDate(draft.to)}` : " — choose an end date"}` : "No dates selected"}
        </p>
        <Separator className="my-3" />
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button onClick={() => {
            setMonth(firstOfMonth(asDate(today)));
            setFocused(today);
            requestAnimationFrame(() => document.getElementById(`${id}-${today}`)?.focus());
          }} size="sm" type="button" variant="ghost">Today</Button>
          {hasRange ? <Button onClick={clearDates} size="sm" type="button" variant="ghost">Clear Dates</Button> : null}
        </div>
        <div className="flex justify-end gap-2">
          <div className="flex gap-2">
            <Button onClick={() => setOpen(false)} size="sm" type="button" variant="outline">Cancel</Button>
            <Button disabled={!draft.from || !draft.to} onClick={() => { setPreset(null); onChange(draft); setOpen(false); }} size="sm" type="button">Apply</Button>
          </div>
        </div>
        </>}
      </PopoverContent>
    </Popover>
  );
}
