import { withBasePath } from "@/lib/app-path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { userManagementSchema } from "@/features/settings/settings-model";
import { manageSupplierUser } from "@/services/settings-service";
import { requestPasswordRecovery } from "@/services/password-recovery-service";

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ message: "Sign in again to manage users." }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ message: "Only Administrators can manage users." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid user request." }, { status: 400 }); }
  const parsed = userManagementSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Check the user details and try again." }, { status: 400 });
  try {
    const user = await manageSupplierUser(actor.supplierId, actor.id, parsed.data);
    const response = NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
    if (parsed.data.action === "reset-password") {
      const receipt = await requestPasswordRecovery(user.email);
      response.cookies.set("ipsos_prototype_email", receipt, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: withBasePath("/email-preview"), maxAge: 86400 });
    }
    revalidatePath("/", "layout");
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const messages: Record<string, string> = { EMAIL_IN_USE: "This email address is already in use.", SELF_CHANGE: "You cannot deactivate your own account or remove your Administrator role.", INVITATION_PENDING: "This user has not accepted their invitation.", USER_NOT_ACTIVE: "Only active users can receive password reset emails.", NOT_FOUND: "User not found.", FORBIDDEN: "You cannot manage this user." };
    return NextResponse.json({ message: messages[code] ?? "The user could not be updated. Please try again." }, { status: code === "NOT_FOUND" ? 404 : code === "FORBIDDEN" ? 403 : messages[code] ? 409 : 500 });
  }
}
