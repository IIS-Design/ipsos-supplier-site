import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { linkConfigurationRequestSchema } from "@/features/settings/integration-model";
import { getSubsample, saveSubsampleLinkConfiguration } from "@/services/subsample-service";
import type { ProjectId, SubsampleId } from "@/types/ids";

export async function PUT(request: Request, context: { params: Promise<{ projectId: string; subsampleId: string }> }) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ message: "Sign in again to save configuration." }, { status: 401 });
  const { projectId, subsampleId } = await context.params;
  const subsample = await getSubsample(actor.supplierId, subsampleId as SubsampleId);
  if (!subsample || subsample.projectId !== projectId) return NextResponse.json({ message: "Subsample not found." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid configuration request." }, { status: 400 }); }
  const parsed = linkConfigurationRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Check the highlighted fields and try again.", errors: parsed.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) }, { status: 400 });
  try {
    const updated = await saveSubsampleLinkConfiguration(actor.supplierId, projectId as ProjectId, subsample.id, parsed.data, actor.id);
    revalidatePath(`/projects/${projectId}/subsamples/${subsampleId}`, "layout");
    return NextResponse.json({ setting: parsed.data.section === "redirects" ? updated.settingsOverrides?.redirects : updated.settingsOverrides?.serverToServer });
  } catch {
    return NextResponse.json({ message: "Configuration could not be saved. Your changes are still available. Please try again." }, { status: 400 });
  }
}
