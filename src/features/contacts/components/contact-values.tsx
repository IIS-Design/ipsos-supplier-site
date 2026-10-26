import { Badge } from "@/components/ui/badge";
import { contactRoles } from "@/features/contacts/contact-model";
import type { SupplierContacts } from "@/types/supplier";

export function ContactValues({
  contacts,
  inherited = false,
}: {
  contacts: SupplierContacts;
  inherited?: boolean;
}) {
  return (
    <dl className="divide-y rounded-md border px-4">
      {contactRoles.map(({ key, label }) => (
        <div
          className="grid gap-2 py-4 sm:grid-cols-[180px_minmax(0,1fr)]"
          key={key}
        >
          <dt className="text-sm font-medium">{label}</dt>
          <dd className="min-w-0 space-y-2 text-sm">
            {contacts[key].length ? (
              contacts[key].map((contact) => (
                <div key={contact.id}>
                  <p className="font-medium">{contact.name}</p>
                  <a
                    className="wrap-break-word text-primary underline-offset-4 hover:underline"
                    href={`mailto:${contact.email}`}
                  >
                    {contact.email}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No {inherited ? "default " : ""}contacts configured.
              </p>
            )}
            {inherited ? (
              <Badge variant="secondary">
                Inherited from Organization Contacts
              </Badge>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
