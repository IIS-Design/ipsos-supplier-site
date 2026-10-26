import { SettingsNavigation } from "@/features/settings/components/settings-navigation";
import type { ReactNode } from "react";
import { requireAdministrator } from "@/lib/auth/session";

export default async function AdministratorSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdministrator();
  return <div className="grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"><aside className="lg:border-r lg:pr-6 lg:pt-10"><SettingsNavigation /></aside><div className="min-w-0">{children}</div></div>;
}
