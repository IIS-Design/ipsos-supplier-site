import { notFound } from "next/navigation";
import { SubsampleWorkspaceShell } from "@/features/subsamples/components/subsample-workspace-shell";
import { AllSubsamplesLoader } from "@/features/subsamples/components/all-subsamples-loader";
import { SubsampleListError } from "@/features/subsamples/components/subsample-list-error";
import type { Subsample } from "@/types/subsample";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/services/project-service";
import { getProjectSubsamples } from "@/services/subsample-service";
import type { ProjectId } from "@/types/ids";

export default async function ProjectSubsamplesRoute({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [{ projectId: rawProjectId }, user] = await Promise.all([
    params,
    getCurrentUser(),
  ]);
  if (!user) notFound();

  const projectId = rawProjectId as ProjectId;
  const project = await getProject(user.supplierId, projectId);
  if (!project) notFound();
  let subsamples: Subsample[] = [];
  let failed = false;
  try { subsamples = await getProjectSubsamples(user.supplierId, projectId); }
  catch { failed = true; }
  return (
    <SubsampleWorkspaceShell project={project} subsamples={subsamples}>
      {failed ? <SubsampleListError /> : <AllSubsamplesLoader projectName={project.name} subsamples={subsamples} />}
    </SubsampleWorkspaceShell>
  );
}
