import type { ContactOverrideInput } from "@/features/contacts/contact-model";
import { getRepositories } from "@/lib/repositories";
import type { ProjectId, SubsampleId, SupplierId, UserId } from "@/types/ids";

export const getSubsamples = (supplierId: SupplierId) =>
  getRepositories().subsamples.listForSupplier(supplierId);

export const getProjectSubsamples = (
  supplierId: SupplierId,
  projectId: ProjectId,
) => getRepositories().subsamples.listByProject(supplierId, projectId);

export const getSubsample = (
  supplierId: SupplierId,
  subsampleId: SubsampleId,
) => getRepositories().subsamples.getById(supplierId, subsampleId);

export const saveSubsampleContacts = (
  supplierId: SupplierId,
  projectId: ProjectId,
  subsampleId: SubsampleId,
  setting: ContactOverrideInput,
  actorId: UserId,
) =>
  getRepositories().subsamples.saveContacts(
    supplierId,
    projectId,
    subsampleId,
    setting,
    actorId,
  );
