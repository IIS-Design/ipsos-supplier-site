import { NextResponse } from "next/server";
import { resetRequestSchema } from "@/lib/auth/recovery-validation";
import {
  getResetLinkState,
  resetMockPassword,
} from "@/services/password-recovery-service";
import { clearMockSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Check the password fields and try again." },
      { status: 400 },
    );
  }
  const parsed = resetRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Check the password fields and try again." },
      { status: 400 },
    );
  try {
    const state = getResetLinkState(parsed.data.token);
    if (state !== "valid")
      return NextResponse.json(
        {
          state,
          message:
            state === "expired"
              ? "This reset link has expired. Request a new link."
              : "This reset link is invalid or has already been used. Request a new link.",
        },
        { status: 410 },
      );
    const result = resetMockPassword(parsed.data.token, parsed.data.password);
    if (result !== "valid")
      return NextResponse.json(
        {
          state: result,
          message: "This link is no longer available. Request a new link.",
        },
        { status: 410 },
      );
    await clearMockSession();
    return NextResponse.json(
      { message: "Your password has been updated." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "Your password could not be updated. Please try again." },
      { status: 503 },
    );
  }
}
