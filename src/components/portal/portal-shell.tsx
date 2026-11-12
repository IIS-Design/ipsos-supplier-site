import type { ReactNode } from "react";
import type { User } from "@/types/user";
import { MockAuthProvider } from "@/components/auth/mock-auth-provider";
import { PortalWidthProvider } from "@/components/portal/portal-width";
import { PortalFooter } from "@/components/portal/portal-footer";
import { PrimaryNavigation } from "@/components/portal/primary-navigation";

export function PortalShell({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}) {
  return (
    <MockAuthProvider initialUser={user}>
      <PortalWidthProvider>
      <div className="portal-surface flex min-h-screen flex-col bg-white">
        <a
          className="sr-only z-50 rounded-md bg-white p-3 font-medium text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="#main-content"
        >
          Skip to main content
        </a>
        <PrimaryNavigation />
        <main
          id="main-content"
          className="mx-auto w-full max-w-(--portal-max-width) flex-1 px-4 py-6 sm:px-6"
        >
          {children}
        </main>
        <PortalFooter />
      </div>
      </PortalWidthProvider>
    </MockAuthProvider>
  );
}
