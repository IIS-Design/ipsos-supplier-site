import { redirect } from "next/navigation";

export default async function ProjectContextRoute({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/projects/${encodeURIComponent(projectId)}/subsamples/`);
}
