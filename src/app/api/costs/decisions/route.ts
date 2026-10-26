import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { decideCosts } from "@/services/cost-service";
import type { CostId } from "@/types/ids";

const decisionSchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    costIds: z.array(z.string().min(1)).min(1).max(100),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Sign in to manage costs." },
      { status: 401 },
    );
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { message: "Only a Supplier Administrator can approve or reject costs." },
      { status: 403 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid cost decision request." },
      { status: 400 },
    );
  }

  const parsed = decisionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Select one or more costs to process." },
      { status: 400 },
    );
  }

  try {
    const updatedCosts = await decideCosts(
      user.supplierId,
      parsed.data.costIds as CostId[],
      parsed.data.decision,
      user.id,
      parsed.data.note,
    );
    return NextResponse.json({ costs: updatedCosts }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update selected costs.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
