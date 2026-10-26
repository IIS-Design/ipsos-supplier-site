import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecoveryPanel } from "@/components/auth/recovery-panel";

export default function PasswordResetSuccessPage() {
  return (
    <RecoveryPanel title="Password updated">
      <p className="text-sm text-muted-foreground" role="status">
        Your password has been updated. Sign in with your new password.
      </p>
      <Button asChild className="w-full">
        <Link href="/login">Back to Sign In</Link>
      </Button>
    </RecoveryPanel>
  );
}
