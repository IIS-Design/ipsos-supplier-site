import type { SupplierId } from "./ids";

export type SupplierSettingSection =
  | "contacts"
  | "redirects"
  | "serverToServer"
  | "security";

export type SupplierContact = {
  id: string;
  name: string;
  email: string;
  userId?: string;
};

export type SupplierContacts = SupplierContact[];

/**
 * Supplier-level defaults. Section payloads remain open until their business
 * fields are defined by the product contract.
 */
export type SupplierSettings = Partial<
  Record<Exclude<SupplierSettingSection, "contacts">, Record<string, unknown>>
> & { contacts?: SupplierContacts };

export type Supplier = {
  id: SupplierId;
  name: string;
  settings: SupplierSettings;
};
