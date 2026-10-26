import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { contactsSchema } from "@/features/contacts/contact-model";
import { saveContactDefaults } from "@/services/supplier-service";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { message: "Your session has expired. Sign in again to save contacts." },
      { status: 401 },
    );
  if (user.role !== "admin")
    return NextResponse.json(
      {
        message:
          "Only an Administrator can edit organization contact defaults.",
      },
      { status: 403 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid contacts request." },
      { status: 400 },
    );
  }
  const parsed = contactsSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Check the contact names and email addresses and try again." },
      { status: 400 },
    );
  try {
    const contacts = await saveContactDefaults(
      user.supplierId,
      parsed.data,
      user.id,
    );
    revalidatePath("/settings");
    revalidatePath("/projects", "layout");
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Organization contact defaults failed to save", error);
    return NextResponse.json(
      {
        message:
          "Contact defaults could not be saved. Your changes are still available. Please try again.",
      },
      { status: 500 },
    );
  }
}
