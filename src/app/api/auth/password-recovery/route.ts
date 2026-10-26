import { NextResponse } from "next/server";
import {
  recoveryConfirmation,
  recoveryRequestSchema,
} from "@/lib/auth/recovery-validation";
import { requestPasswordRecovery } from "@/services/password-recovery-service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 },
    );
  }
  const parsed = recoveryRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 },
    );
  try {
    const receipt = await requestPasswordRecovery(parsed.data.email);
    const response = NextResponse.json({ message: recoveryConfirmation });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set("ipsos_prototype_email", receipt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/email-preview",
      maxAge: 86400,
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the service. Please try again." },
      { status: 503 },
    );
  }
}
