import { notFound } from "next/navigation";
import { DetailsPanel } from "@/features/subsamples/components/details-panel";
import { getSubsampleWorkspaceData } from "@/features/subsamples/data/get-workspace-data";

export default async function SubsampleDetailsRoute({
  params,
}: {
  params: Promise<{ projectId: string; subsampleId: string }>;
}) {
  const { projectId, subsampleId } = await params;
  const workspace = await getSubsampleWorkspaceData(projectId, subsampleId);
  if (!workspace) notFound();

  return <DetailsPanel subsample={workspace.subsample} />;
}
