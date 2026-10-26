import { notFound } from "next/navigation";
import {
  ConfigurationPanel,
  type ConfigurationSection,
} from "@/features/subsamples/components/configuration-panel";
import { getSubsampleWorkspaceData } from "@/features/subsamples/data/get-workspace-data";

const sections: ConfigurationSection[] = [
  "entry-links",
  "redirects",
  "server-to-server",
  "security",
];

export default async function SubsampleConfigurationRoute({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; subsampleId: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const [{ projectId, subsampleId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const workspace = await getSubsampleWorkspaceData(projectId, subsampleId);
  if (!workspace) notFound();
  const section =
    sections.find((item) => item === query.section) ?? "entry-links";

  return (
    <ConfigurationPanel
      activeSection={section}
      projectId={projectId}
      subsampleId={subsampleId}
    />
  );
}
