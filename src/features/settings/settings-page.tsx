import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdministrator } from "@/lib/auth/session";
import { getSupplier } from "@/services/supplier-service";
import { getUsers } from "@/services/user-service";
import { getSupplierPreferences } from "@/services/settings-service";
import { emptyContacts } from "@/features/contacts/contact-model";
import { settingsLabels, type SettingsSection } from "./settings-model";
import { SettingsForm } from "./components/settings-form";
import { SettingsUsers } from "./components/settings-users";
import { DefaultContacts } from "./components/default-contacts";

export async function SettingsPage({ section }: { section: SettingsSection }) {
  const actor = await requireAdministrator();
  const supplier = await getSupplier(actor.supplierId);
  if (!supplier) notFound();
  const label = settingsLabels[section];
  return <div className="space-y-8">
    <header className="space-y-2"><h1 className="text-2xl font-semibold tracking-tight">{label}</h1><nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-sm"><li><Link aria-label="Home" href="/projects"><Home aria-hidden="true" className="size-4" /></Link></li><li aria-hidden="true"><ChevronRight className="size-4 text-muted-foreground" /></li><li><Link className="text-muted-foreground hover:text-foreground" href="/settings">Settings</Link></li><li aria-hidden="true"><ChevronRight className="size-4 text-muted-foreground" /></li><li aria-current="page">{label}</li></ol></nav></header>
    {section === "users" ? (
      <>
        <section aria-labelledby="user-management-heading" className="space-y-5">
          <h2 className="text-xl font-semibold" id="user-management-heading">User Management</h2>
          <SettingsUsers users={await getUsers(actor.supplierId)} actorId={actor.id} />
        </section>
        <div className="max-w-3xl border-t pt-6">
          <DefaultContacts users={await getUsers(actor.supplierId)} contacts={supplier.settings.contacts ?? emptyContacts()} />
        </div>
      </>
    ) : (
      <div className="max-w-3xl"><SettingsForm key={section} section={section} initialValues={await getSupplierPreferences(actor.supplierId)} /></div>
    )}
  </div>;
}
