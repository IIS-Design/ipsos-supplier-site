import { redirect } from "next/navigation";

export default async function SubsampleWorkspaceIndex({
  params,
}: {
  params: Promise<{ projectId: string; subsampleId: string }>;
}) {
  const { projectId, subsampleId } = await params;
  redirect(`/projects/${projectId}/subsamples/${subsampleId}/details/`);
}
