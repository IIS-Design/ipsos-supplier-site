import "server-only";
import { getUserByEmail } from "@/services/user-service";
import { mockRecoveryStore } from "@/lib/auth/mock-recovery-store";

export async function requestPasswordRecovery(email: string) {
  const user = await getUserByEmail(email);
  return mockRecoveryStore.request(email, Boolean(user && (user.status ?? "active") === "active"));
}

export const getRecoveryMail = (receipt: string) =>
  mockRecoveryStore.inbox(receipt);
export const getResetLinkState = (token: string) =>
  mockRecoveryStore.status(token);
export const resetMockPassword = (token: string, password: string) =>
  mockRecoveryStore.reset(token, password);
export const acceptsMockPassword = (email: string, password: string) =>
  mockRecoveryStore.acceptsPassword(email, password);
