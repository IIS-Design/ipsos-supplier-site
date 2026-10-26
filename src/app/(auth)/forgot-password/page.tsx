import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { RecoveryPanel, SignInLink } from "@/components/auth/recovery-panel";

export default function ForgotPasswordPage() {
  return (
    <RecoveryPanel title="Forgot password?">
      <p className="text-sm text-muted-foreground">
        Enter your account email address to request a password reset link.
      </p>
      <ForgotPasswordForm />
      <SignInLink />
    </RecoveryPanel>
  );
}
