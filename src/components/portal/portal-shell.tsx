import type { ReactNode } from "react";
import type { User } from "@/types/user";
import { MockAuthProvider } from "@/components/auth/mock-auth-provider";
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
      <div className="portal-surface min-h-screen bg-white">
        <a
          className="sr-only z-50 rounded-md bg-white p-3 font-medium text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="#main-content"
        >
          Skip to main content
        </a>
        <PrimaryNavigation />
        <main
          id="main-content"
          className="mx-auto w-full max-w-300 px-4 py-6 sm:px-6"
        >
          {children}
        </main>
      </div>
    </MockAuthProvider>
  );
}
