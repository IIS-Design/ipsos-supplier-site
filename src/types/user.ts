import type { SupplierId, UserId } from "./ids";

/** Roles currently supported by the portal domain model. */
export type UserRole = "admin" | "user";

export type User = {
  id: UserId;
  supplierId: SupplierId;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status?: "active" | "invited" | "inactive";
};