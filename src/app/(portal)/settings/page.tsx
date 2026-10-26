import { notFound } from "next/navigation";
import { requireAdministrator } from "@/lib/auth/session";
import { getSupplier } from "@/services/supplier-service";
import { emptyContacts } from "@/features/contacts/contact-model";
import { OrganizationContacts } from "@/features/settings/components/organization-contacts";

export default async function SettingsRoute() {
  const user = await requireAdministrator();
  const supplier = await getSupplier(user.supplierId);
  if (!supplier) notFound();
  return (
    <OrganizationContacts
      contacts={supplier.settings.contacts ?? emptyContacts()}
      supplierName={supplier.name}
    />
  );
}
