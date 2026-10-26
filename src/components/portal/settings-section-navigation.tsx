"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Section = { id: string; label: string; Icon: LucideIcon; href?: string };
export function SettingsSectionNavigation({ title, sections, activeSection, onSelect }: { title: string; sections: Section[]; activeSection: string; onSelect: (section: string) => void }) {
  return <>
    <div className="lg:hidden"><Select value={activeSection} onValueChange={onSelect}><SelectTrigger aria-label={`${title} section`}><SelectValue /></SelectTrigger><SelectContent>{sections.map(section => <SelectItem key={section.id} value={section.id}>{section.label}</SelectItem>)}</SelectContent></Select></div>
    <nav aria-label={title} className="hidden space-y-1 lg:block">
      <p className="mb-4 px-3 text-sm text-muted-foreground">{title}</p>
      {sections.map(({ id, label, Icon, href }) => {
        const className = cn("flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", activeSection === id && "bg-muted text-foreground");
        const content = <><Icon aria-hidden="true" className="size-4 shrink-0" />{label}</>;
        return href ? <Link key={id} href={href} aria-current={activeSection === id ? "page" : undefined} className={className}>{content}</Link> : <button key={id} type="button" aria-pressed={activeSection === id} className={className} onClick={() => onSelect(id)}>{content}</button>;
      })}
    </nav>
  </>;
}
