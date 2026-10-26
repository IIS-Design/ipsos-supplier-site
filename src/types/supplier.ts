import type { SupplierId } from "./ids";

export type SupplierSettingSection =
  | "contacts"
  | "redirects"
  | "serverToServer"
  | "security";

export type SupplierContactRole =
  | "projectManager"
  | "salesContact"
  | "financeContact"
  | "helpDesk";

export type SupplierContact = {
  id: string;
  name: string;
  email: string;
};

export type SupplierContacts = Record<SupplierContactRole, SupplierContact[]>;

/**
 * Supplier-level defaults. Section payloads remain open until their business
 * fields are defined by the product contract.
 */
export type SupplierSettings = Partial<
  Record<SupplierSettingSection, Record<string, unknown>>
> & { contacts?: SupplierContacts };

export type Supplier = {
  id: SupplierId;
  name: string;
  settings: SupplierSettings;
};
