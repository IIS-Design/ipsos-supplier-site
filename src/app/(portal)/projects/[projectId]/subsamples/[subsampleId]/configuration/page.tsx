import { redirect } from "next/navigation";
export default async function LegacyConfiguration({ params, searchParams }: {
  params: Promise<{ projectId: string; subsampleId: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const [{ projectId, subsampleId }, query] = await Promise.all([params, searchParams]);
  const base = `/projects/${projectId}/subsamples/${subsampleId}`;
  redirect(query.section === "security" ? `${base}/security` : `${base}/links${query.section ? `?section=${encodeURIComponent(query.section)}` : ""}`);
}
