import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProjectExpansion } from "@/features/projects/components/project-expansion";
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
  const [project, subsamples] = await Promise.all([
    getProject(user.supplierId, projectId),
    getProjectSubsamples(user.supplierId, projectId),
  ]);
  if (!project) notFound();

  return (
    <section aria-labelledby="all-subsamples-heading" className="space-y-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projects">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>All Subsamples</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            id="all-subsamples-heading"
          >
            Subsamples for {project.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Available subsamples associated with this project.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {subsamples.length} subsamples
        </span>
      </header>
      {subsamples.length === 0 ? (
        <p className="rounded-md border px-4 py-8 text-center text-sm text-muted-foreground">
          No subsamples are available for this project.
        </p>
      ) : (
        <ProjectExpansion subsamples={subsamples} />
      )}
    </section>
  );
}
