import type { AccountProfile } from "@/features/account/account-model";
import { getRepositories } from "@/lib/repositories";
import type { SupplierId, UserId } from "@/types/ids";

export const getUsers = (supplierId: SupplierId) =>
  getRepositories().users.listForSupplier(supplierId);

export const getUser = (supplierId: SupplierId, userId: UserId) =>
  getRepositories().users.getById(supplierId, userId);

export const getUserByEmail = (email: string) =>
  getRepositories().users.getByEmail(email);

export const saveAccountProfile = (supplierId: SupplierId, userId: UserId, profile: AccountProfile) =>
  getRepositories().users.saveProfile(supplierId, userId, profile);
