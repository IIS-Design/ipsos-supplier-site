import { NextResponse } from "next/server";
import { getUserByEmail } from "@/services/user-service";
import { clearMockSession, setMockSession } from "@/lib/auth/session";
import { acceptsMockPassword } from "@/services/password-recovery-service";

const INVALID_CREDENTIALS = {
  title: "Unable to sign in",
  message: "The email or password you entered is incorrect. Please try again.",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const { email, password, keepMeSignedIn } = body as Record<string, unknown>;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 128
  ) {
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const user = await getUserByEmail(email.trim());
  if (!user || !acceptsMockPassword(user.email, password))
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });

  await setMockSession(user, keepMeSignedIn === true);
  return NextResponse.json({ user });
}

export async function DELETE() {
  await clearMockSession();
  return NextResponse.json({ success: true });
}
