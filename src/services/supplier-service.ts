import { getRepositories } from "@/lib/repositories";
import type { SupplierId, UserId } from "@/types/ids";
import type { SupplierContacts } from "@/types/supplier";

export const listSuppliers = () => getRepositories().suppliers.list();

export const getSupplier = (supplierId: SupplierId) =>
  getRepositories().suppliers.getById(supplierId);

export const getContactOptions = (supplierId: SupplierId) =>
  getRepositories().suppliers.listContactOptions(supplierId);

export const saveContactDefaults = (
  supplierId: SupplierId,
  contacts: SupplierContacts,
  actorId: UserId,
) =>
  getRepositories().suppliers.saveContactDefaults(
    supplierId,
    contacts,
    actorId,
  );
