import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { restoreMockPendingCosts } from "@/lib/repositories/mock/mock-repositories";

/** Prototype-only: resets fixture costs rather than changing any external billing system. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to restore demo costs." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ message: "Only a Supplier Administrator can restore demo costs." }, { status: 403 });
  const count = restoreMockPendingCosts(user.supplierId);
  return NextResponse.json({ count });
}
