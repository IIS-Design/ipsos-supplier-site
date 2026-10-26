import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { accountSchema } from "@/features/account/account-model";
import { saveAccountProfile } from "@/services/user-service";

export async function PUT(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ message: "Your session has expired. Sign in again to save your account." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid account request." }, { status: 400 }); }
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Check your name and email address and try again.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const user = await saveAccountProfile(actor.supplierId, actor.id, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const conflict = error instanceof Error && error.message === "EMAIL_IN_USE";
    return NextResponse.json({ message: conflict ? "This email address is already in use." : "Your account could not be saved. Please try again." }, { status: conflict ? 409 : 500 });
  }
}
