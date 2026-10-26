import "server-only";
import { getRepositories } from "@/lib/repositories";
import type { SupplierId, UserId } from "@/types/ids";
import type { SettingsValues, EditableSettingsSection, UserManagementRequest } from "@/features/settings/settings-model";

export const getSupplierPreferences = (supplierId: SupplierId) => getRepositories().settings.get(supplierId);
export const saveSupplierPreferences = (supplierId: SupplierId, actorId: UserId, section: EditableSettingsSection, values: SettingsValues) => getRepositories().settings.save(supplierId, actorId, section, values);
export const manageSupplierUser = (supplierId: SupplierId, actorId: UserId, request: UserManagementRequest) => getRepositories().users.manage(supplierId, actorId, request);
