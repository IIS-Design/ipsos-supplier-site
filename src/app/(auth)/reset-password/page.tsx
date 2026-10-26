import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ResetLinkState } from "@/components/auth/reset-link-state";
import { getResetLinkState } from "@/services/password-recovery-service";

export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const state = getResetLinkState(token);
  if (state !== "valid") return <ResetLinkState state={state} />;
  return <ResetPasswordForm token={token} />;
}
