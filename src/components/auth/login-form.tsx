"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMockAuth } from "@/components/auth/mock-auth-provider";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Enter a valid email address.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  keepMeSignedIn: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useMockAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", keepMeSignedIn: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const result = await signIn(
      values.email,
      values.password,
      values.keepMeSignedIn,
    );
    if (!result.success) {
      setValue("password", "");
      setServerError(result.message);
      return;
    }
    router.replace("/projects");
    router.refresh();
  };

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      {serverError ? (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
        >
          <p className="font-semibold">Unable to sign in</p>
          <p className="mt-1">{serverError}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block font-medium" htmlFor="email">
          Email Address
        </label>
        <Input
          {...register("email")}
          autoComplete="username"
          id="email"
          inputMode="email"
          type="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email ? (
          <FieldError id="email-error">
            {errors.email.message}
          </FieldError>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block font-medium" htmlFor="password">
          Password
        </label>
        <PasswordInput
          {...register("password")}
          autoComplete="current-password"
          id="password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password ? (
          <FieldError id="password-error">
            {errors.password.message}
          </FieldError>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <label
          className="flex items-center gap-2 font-normal"
          htmlFor="keepMeSignedIn"
        >
          <input
            {...register("keepMeSignedIn")}
            className="size-4 accent-primary"
            id="keepMeSignedIn"
            type="checkbox"
          />
          Keep Me Signed In
        </label>
        <a
          className="font-medium text-primary underline-offset-4 hover:underline"
          href="/forgot-password"
        >
          Forgot Password?
        </a>
      </div>

      <Button
        className="w-full font-semibold"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing In…" : "Sign In"}
      </Button>
    </form>
  );
}
