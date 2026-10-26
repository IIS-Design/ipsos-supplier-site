"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Users, ListChecks, Route, ArrowLeftRight, Shield } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { settingsSections, settingsLabels, type SettingsSection } from "@/features/settings/settings-model";
import { confirmContactNavigation } from "@/features/contacts/use-unsaved-changes";
import { cn } from "@/lib/utils";
const icons = { organization: Building2, users: Users, "survey-configuration": ListChecks, redirects: Route, "server-to-server": ArrowLeftRight, security: Shield };
export const settingsHref = (section: SettingsSection) => section === "organization" ? "/settings" : `/settings/${section}`;
export function SettingsNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const section = settingsSections.find(key => settingsHref(key) === pathname) ?? "organization";
  return <>
    <div className="lg:hidden"><Select value={section} onValueChange={(value) => { if (confirmContactNavigation()) router.push(settingsHref(value as SettingsSection)); }}><SelectTrigger aria-label="Supplier Settings section"><SelectValue /></SelectTrigger><SelectContent>{settingsSections.map(key => <SelectItem key={key} value={key}>{settingsLabels[key]}</SelectItem>)}</SelectContent></Select></div>
    <nav aria-label="Supplier Settings" className="hidden space-y-1 lg:block">
      <p className="mb-4 px-3 text-sm text-muted-foreground">Supplier Settings</p>
      {settingsSections.map(key => { const Icon = icons[key]; return <Link key={key} href={settingsHref(key)} aria-current={section === key ? "page" : undefined} className={cn("flex min-h-11 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-muted hover:text-foreground", section === key && "bg-muted text-foreground")}><Icon aria-hidden="true" className="size-4" />{settingsLabels[key]}</Link>; })}
    </nav>
  </>;
}
