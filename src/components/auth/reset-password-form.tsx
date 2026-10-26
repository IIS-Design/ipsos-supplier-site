"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { RecoveryPanel, SignInLink } from "@/components/auth/recovery-panel";
import { ResetLinkState } from "@/components/auth/reset-link-state";
import { resetPasswordSchema } from "@/lib/auth/recovery-validation";
import { withBasePath } from "@/lib/app-path";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [linkState, setLinkState] = useState<"invalid" | "expired" | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await fetch(withBasePath("/api/auth/reset-password/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...values }),
        signal: AbortSignal.timeout(15000),
      });
      const payload = (await response.json()) as {
        state?: string;
        message?: string;
      };
      if (!response.ok) {
        if (payload.state === "expired" || payload.state === "invalid") {
          reset();
          setLinkState(payload.state);
        } else
          setError(
            payload.message ??
              "Your password could not be updated. Please try again.",
          );
        return;
      }
      reset();
      router.replace("/reset-password/success");
      router.refresh();
    } catch {
      setError(
        "We could not confirm the password update. Check your connection and try again. If this link has already been used, try signing in with your new password.",
      );
    }
  });
  if (linkState) return <ResetLinkState state={linkState} />;
  return (
    <RecoveryPanel title="Create new password">
      <p className="text-sm text-muted-foreground">
        Enter and confirm your new password. Use 1–128 characters.
      </p>
      <form
        aria-busy={isSubmitting}
        className="space-y-5"
        noValidate
        onSubmit={submit}
      >
        {error ? (
          <p
            className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {(
          [
            { key: "password", label: "New Password" },
            { key: "confirmPassword", label: "Confirm Password" },
          ] as const
        ).map(({ key, label }) => (
          <div className="space-y-2" key={key}>
            <label
              className="block text-sm font-medium"
              htmlFor={`reset-${key}`}
            >
              {label}
            </label>
            <PasswordInput
              {...register(key)}
              aria-describedby={errors[key] ? `${key}-error` : undefined}
              aria-invalid={Boolean(errors[key])}
              autoComplete="new-password"
              disabled={isSubmitting}
              id={`reset-${key}`}
              maxLength={128}
              visibilityLabel={label.toLowerCase()}
            />
            {errors[key] ? (
              <FieldError id={`${key}-error`}>
                {errors[key]?.message}
              </FieldError>
            ) : null}
          </div>
        ))}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving Password…" : "Save Password"}
        </Button>
        <span className="sr-only" role="status">
          {isSubmitting ? "Updating your password. Please wait." : ""}
        </span>
      </form>
      <SignInLink />
    </RecoveryPanel>
  );
}
