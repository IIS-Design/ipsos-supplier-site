import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { preferencesRequestSchema } from "@/features/settings/settings-model";
import { saveSupplierPreferences } from "@/services/settings-service";

export async function PUT(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ message: "Sign in again to save settings." }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ message: "Only Administrators can change supplier settings." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid settings request." }, { status: 400 }); }
  const parsed = preferencesRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Check your settings and try again." }, { status: 400 });
  try {
    const values = await saveSupplierPreferences(actor.supplierId, actor.id, parsed.data.section, parsed.data.values);
    revalidatePath("/settings", "layout");
    revalidatePath("/projects", "layout");
    return NextResponse.json({ values }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Settings save failed", error instanceof Error && error.name !== "ZodError" ? error.message : "Invalid settings state");
    return NextResponse.json({ message: "Settings could not be saved. Please try again." }, { status: 500 });
  }
}
