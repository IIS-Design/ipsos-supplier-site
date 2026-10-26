import { SettingsLayout } from "@/components/portal/settings-layout";
import { SettingsNavigation } from "@/features/settings/components/settings-navigation";
import type { ReactNode } from "react";
import { requireAdministrator } from "@/lib/auth/session";

export default async function AdministratorSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdministrator();
  return <SettingsLayout navigation={<SettingsNavigation />}>{children}</SettingsLayout>;
}
