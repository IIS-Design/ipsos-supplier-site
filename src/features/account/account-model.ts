import { z } from "zod";

export const accountSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(100, "Use 100 characters or fewer."),
  lastName: z.string().trim().min(1, "Enter your last name.").max(100, "Use 100 characters or fewer."),
  email: z.string().trim().toLowerCase().min(1, "Enter your email address.").max(254, "Enter a valid email address.").email("Enter a valid email address."),
}).strict();
export type AccountProfile = z.infer<typeof accountSchema>;
