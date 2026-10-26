import { notFound, redirect } from "next/navigation";
import { settingsSections, type SettingsSection } from "@/features/settings/settings-model";
import { SettingsPage } from "@/features/settings/settings-page";
export default async function SettingsSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!settingsSections.includes(section as SettingsSection)) notFound();
  if (section === "organization") redirect("/settings");
  return <SettingsPage section={section as SettingsSection} />;
}
