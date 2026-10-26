"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recoveryRequestSchema } from "@/lib/auth/recovery-validation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof recoveryRequestSchema>>({
    resolver: zodResolver(recoveryRequestSchema),
    defaultValues: { email: "" },
  });
  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setError(
          payload.message ??
            "Your request could not be completed. Please try again.",
        );
        return;
      }
      router.push("/forgot-password/confirmation");
    } catch {
      setError(
        "Unable to connect to the service. Check your connection and try again.",
      );
    }
  });
  return (
    <form
      aria-busy={isSubmitting}
      className="space-y-4"
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
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="recovery-email">
          Email Address
        </label>
        <Input
          {...register("email")}
          aria-describedby={errors.email ? "recovery-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          disabled={isSubmitting}
          id="recovery-email"
          inputMode="email"
          maxLength={254}
          type="email"
        />
        {errors.email ? (
          <FieldError id="recovery-email-error">
            {errors.email.message}
          </FieldError>
        ) : null}
      </div>
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Requesting Reset…" : "Send Reset Link"}
      </Button>
      <span className="sr-only" role="status">
        {isSubmitting ? "Requesting password recovery. Please wait." : ""}
      </span>
    </form>
  );
}
