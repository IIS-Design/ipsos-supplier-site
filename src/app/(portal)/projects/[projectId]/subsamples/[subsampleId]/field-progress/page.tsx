import { notFound } from "next/navigation";
import { FieldProgressPanel } from "@/features/subsamples/components/field-progress-panel";
import { getSubsampleWorkspaceData } from "@/features/subsamples/data/get-workspace-data";

export default async function FieldProgressRoute({
  params,
}: {
  params: Promise<{ projectId: string; subsampleId: string }>;
}) {
  const { projectId, subsampleId } = await params;
  const workspace = await getSubsampleWorkspaceData(projectId, subsampleId);
  if (!workspace) notFound();

  return <FieldProgressPanel subsample={workspace.subsample} />;
}
