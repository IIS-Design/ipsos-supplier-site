import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SubsampleWorkspaceShell } from "@/features/subsamples/components/subsample-workspace-shell";
import { getSubsampleWorkspaceData } from "@/features/subsamples/data/get-workspace-data";

export default async function SubsampleWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string; subsampleId: string }>;
}) {
  const { projectId, subsampleId } = await params;
  const workspace = await getSubsampleWorkspaceData(projectId, subsampleId);
  if (!workspace) notFound();

  return (
    <SubsampleWorkspaceShell
      project={workspace.project}
      subsample={workspace.subsample}
      subsamples={workspace.subsamples}
    >
      {children}
    </SubsampleWorkspaceShell>
  );
}
