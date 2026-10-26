import Link from "next/link";
import { RecoveryPanel, SignInLink } from "@/components/auth/recovery-panel";
import { recoveryConfirmation } from "@/lib/auth/recovery-validation";

export default function RecoveryConfirmationPage() {
  return (
    <RecoveryPanel title="Check your email">
      <p className="text-sm text-muted-foreground" role="status">
        {recoveryConfirmation}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <SignInLink />
        <Link
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          href="/forgot-password"
        >
          Use a Different Email
        </Link>
      </div>
    </RecoveryPanel>
  );
}
