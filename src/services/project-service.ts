import { getRepositories } from "@/lib/repositories";
import type { ProjectId, SupplierId } from "@/types/ids";

export const getProjects = (supplierId: SupplierId) =>
  getRepositories().projects.listForSupplier(supplierId);

export const getProject = (supplierId: SupplierId, projectId: ProjectId) =>
  getRepositories().projects.getById(supplierId, projectId);
