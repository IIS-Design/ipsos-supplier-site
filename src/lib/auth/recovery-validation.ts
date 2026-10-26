import { z } from "zod";

export const recoveryRequestSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .max(254, "Enter a valid email address.")
      .email("Enter a valid email address."),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Enter a new password.")
      .max(128, "Use no more than 128 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export const resetRequestSchema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/, "This reset link is invalid."),
    password: z
      .string()
      .min(1, "Enter a new password.")
      .max(128, "Use no more than 128 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password.").max(128),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export const recoveryConfirmation =
  "If an account exists for the email address provided, you will receive a password reset email shortly.";
