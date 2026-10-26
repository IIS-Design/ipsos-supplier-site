"use client";

import { usePathname, useRouter } from "next/navigation";
import { Building2, Users, ListChecks, Route, ArrowLeftRight, Shield } from "lucide-react";
import { SettingsSectionNavigation } from "@/components/portal/settings-section-navigation";
import { settingsSections, settingsLabels, type SettingsSection } from "@/features/settings/settings-model";
import { confirmContactNavigation } from "@/features/contacts/use-unsaved-changes";
const icons = { organization: Building2, users: Users, "survey-configuration": ListChecks, redirects: Route, "server-to-server": ArrowLeftRight, security: Shield };
export const settingsHref = (section: SettingsSection) => section === "organization" ? "/settings" : `/settings/${section}`;
export function SettingsNavigation() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const router = useRouter();
  const section = settingsSections.find(key => settingsHref(key) === pathname) ?? "organization";
  return <SettingsSectionNavigation title="Supplier Settings" activeSection={section} sections={settingsSections.map(key => ({ id: key, label: settingsLabels[key], Icon: icons[key], href: settingsHref(key) }))} onSelect={value => { if (confirmContactNavigation()) router.push(settingsHref(value as SettingsSection)); }} />;
}
