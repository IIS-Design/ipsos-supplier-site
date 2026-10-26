import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";
import { PortalShell } from "@/components/portal/portal-shell";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  return <PortalShell user={user}>{children}</PortalShell>;
}
