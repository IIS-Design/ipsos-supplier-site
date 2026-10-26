import { notFound } from "next/navigation";
import { CostsPanel } from "@/features/subsamples/components/costs-panel";
import { getSubsampleWorkspaceData } from "@/features/subsamples/data/get-workspace-data";

export default async function SubsampleCostsRoute({
  params,
}: {
  params: Promise<{ projectId: string; subsampleId: string }>;
}) {
  const { projectId, subsampleId } = await params;
  const workspace = await getSubsampleWorkspaceData(projectId, subsampleId);
  if (!workspace) notFound();

  const costs = workspace.costs.filter(
    (cost) =>
      cost.scope.scopeType === "subsample" &&
      cost.scope.subsampleId === workspace.subsample.id,
  );

  return <CostsPanel costs={costs} />;
}
