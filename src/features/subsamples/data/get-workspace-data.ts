import "server-only";

import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getCosts } from "@/services/cost-service";
import { getProject } from "@/services/project-service";
import {
  getProjectSubsamples,
  getSubsample,
} from "@/services/subsample-service";
import { getSupplier } from "@/services/supplier-service";
import type { ProjectId, SubsampleId } from "@/types/ids";

/** Request-memoized supplier-scoped data shared by the workspace layout and its tab pages. */
export const getSubsampleWorkspaceData = cache(
  async (projectIdValue: string, subsampleIdValue: string) => {
    const user = await getCurrentUser();
    if (!user) return null;

    const projectId = projectIdValue as ProjectId;
    const subsampleId = subsampleIdValue as SubsampleId;
    const [project, subsample, subsamples, supplier, costs] = await Promise.all(
      [
        getProject(user.supplierId, projectId),
        getSubsample(user.supplierId, subsampleId),
        getProjectSubsamples(user.supplierId, projectId),
        getSupplier(user.supplierId),
        getCosts(user.supplierId),
      ],
    );

    if (
      !project ||
      !subsample ||
      !supplier ||
      subsample.projectId !== project.id
    ) {
      return null;
    }

    return { user, project, subsample, subsamples, supplier, costs };
  },
);
