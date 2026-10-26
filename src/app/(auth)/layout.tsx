import type { ReactNode } from "react";
import { MockAuthProvider } from "@/components/auth/mock-auth-provider";
import { IpsosLogo } from "@/components/ipsos-logo";

export default function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MockAuthProvider initialUser={null}>
      <main className="mx-auto flex min-h-screen max-w-300 bg-background items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-110">
          <div className="mb-6 flex items-center justify-center gap-4 text-2xl font-semibold">
            <IpsosLogo authentication />
            <span>Supplier Site</span>
          </div>
          {children}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Account access is managed by your organization. Contact your Supplier
            Administrator for assistance.
          </p>
        </div>
      </main>
    </MockAuthProvider>
  );
}
