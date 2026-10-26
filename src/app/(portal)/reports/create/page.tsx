import { notFound } from "next/navigation";
import { ReportCreateForm } from "@/features/reports/components/report-create-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getProjects } from "@/services/project-service";
import { getSubsamples } from "@/services/subsample-service";

export default async function ReportCreateRoute({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) notFound();
  const [projects, subsamples] = await Promise.all([
    getProjects(user.supplierId),
    getSubsamples(user.supplierId),
  ]);

  return (
    <ReportCreateForm
      projects={projects}
      requestedType={query.type}
      subsamples={subsamples}
    />
  );
}
