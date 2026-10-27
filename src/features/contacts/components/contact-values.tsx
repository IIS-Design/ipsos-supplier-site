import { Badge } from "@/components/ui/badge";
import type { SupplierContacts } from "@/types/supplier";
export function ContactValues({ contacts, inherited = false }: { contacts: SupplierContacts; inherited?: boolean }) {
  return <div className="space-y-3">{contacts.length ? <ul aria-label="Contacts" className="flex flex-wrap gap-2">{contacts.map(contact => <li key={contact.id} className="max-w-full"><Badge variant="secondary" className="whitespace-normal wrap-break-word"><a href={`mailto:${contact.email}`}>{contact.name ? `${contact.name} (${contact.email})` : contact.email}</a></Badge></li>)}</ul> : <p className="text-muted-foreground">No {inherited ? "default " : ""}contacts configured.</p>}</div>;
}
