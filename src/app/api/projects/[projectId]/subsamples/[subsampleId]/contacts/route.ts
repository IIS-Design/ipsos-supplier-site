import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { contactOverrideSchema } from "@/features/contacts/contact-model";
import {
  getSubsample,
  saveSubsampleContacts,
} from "@/services/subsample-service";
import type { ProjectId, SubsampleId } from "@/types/ids";

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ projectId: string; subsampleId: string }>;
  },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { message: "Your session has expired. Sign in again to save contacts." },
      { status: 401 },
    );
  const { projectId, subsampleId } = await context.params;
  const subsample = await getSubsample(
    user.supplierId,
    subsampleId as SubsampleId,
  );
  if (!subsample || subsample.projectId !== projectId)
    return NextResponse.json(
      { message: "Subsample not found." },
      { status: 404 },
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
  const parsed = contactOverrideSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Check your contact selections and try again." },
      { status: 400 },
    );
  try {
    const updated = await saveSubsampleContacts(
      user.supplierId,
      projectId as ProjectId,
      subsample.id,
      parsed.data,
      user.id,
    );
    revalidatePath(
      `/projects/${projectId}/subsamples/${subsampleId}`,
      "layout",
    );
    return NextResponse.json({ setting: updated.settingsOverrides?.contacts });
  } catch {
    return NextResponse.json(
      {
        message:
          "Contacts could not be saved. A selected contact may be unavailable. Your changes are still available; try again or reload.",
      },
      { status: 400 },
    );
  }
}
