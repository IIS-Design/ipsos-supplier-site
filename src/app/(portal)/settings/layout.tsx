import type { ReactNode } from "react";
import { requireAdministrator } from "@/lib/auth/session";

export default async function AdministratorSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdministrator();
  return children;
}
