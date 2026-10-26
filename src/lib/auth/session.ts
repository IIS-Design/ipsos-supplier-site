import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/services/user-service";
import type { SupplierId, UserId } from "@/types/ids";
import type { User } from "@/types/user";

const SESSION_COOKIE = "ipsos_supplier_session";
const DEFAULT_SESSION_SECONDS = 60 * 60 * 8;
const REMEMBERED_SESSION_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret(): string {
  const secret = process.env.MOCK_AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("MOCK_AUTH_SECRET must be set when running in production.");
  }
  return "local-development-only-mock-auth-secret";
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(
  userId: string,
  supplierId: string,
  expiresAt: number,
): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, supplierId, expiresAt }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(
  token: string,
): { userId: UserId; supplierId: SupplierId; expiresAt: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as {
      userId?: unknown;
      supplierId?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.supplierId !== "string" ||
      typeof decoded.expiresAt !== "number" ||
      !Number.isSafeInteger(decoded.expiresAt) ||
      decoded.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      userId: decoded.userId as UserId,
      supplierId: decoded.supplierId as SupplierId,
      expiresAt: decoded.expiresAt,
    };
  } catch {
    return null;
  }
}

export function getMockSessionMaxAge(keepMeSignedIn: boolean): number {
  return keepMeSignedIn ? REMEMBERED_SESSION_SECONDS : DEFAULT_SESSION_SECONDS;
}

export async function setMockSession(
  user: User,
  keepMeSignedIn: boolean,
): Promise<void> {
  const maxAge = getMockSessionMaxAge(keepMeSignedIn);
  const expiresAt = Date.now() + maxAge * 1000;
  const token = createSessionToken(user.id, user.supplierId, expiresAt);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearMockSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  return getUser(session.supplierId, session.userId);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login/");
  return user;
}

export async function requireAdministrator(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/projects/");
  return user;
}
