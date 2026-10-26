"use client";

import { Button } from "@/components/ui/button";
import { RecoveryPanel, SignInLink } from "@/components/auth/recovery-panel";

export function RecoveryError({ retry }: { retry: () => void }) {
  return (
    <RecoveryPanel title="Recovery unavailable">
      <p className="text-sm text-muted-foreground" role="alert">
        We could not load password recovery. Please try again.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={retry} type="button">
          Try Again
        </Button>
        <SignInLink />
      </div>
    </RecoveryPanel>
  );
}
