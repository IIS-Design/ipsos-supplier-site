import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecoveryPanel, SignInLink } from "@/components/auth/recovery-panel";

export function ResetLinkState({ state }: { state: "invalid" | "expired" }) {
  return (
    <RecoveryPanel
      title={state === "expired" ? "Reset link expired" : "Invalid reset link"}
    >
      <p className="text-sm text-muted-foreground" role="alert">
        {state === "expired"
          ? "This password reset link has expired. Links are valid for 60 minutes. Request a new link to continue."
          : "This password reset link is invalid or has already been used. Request a new link to continue."}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild>
          <Link href="/forgot-password">Request a New Link</Link>
        </Button>
        <SignInLink />
      </div>
    </RecoveryPanel>
  );
}
