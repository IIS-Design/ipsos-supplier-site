"use client";

import { usePrototypeState } from "@/components/prototype-state";
import { CopyValue } from "@/components/ui/copy-value";
import { getIpsosContacts, type Subsample } from "@/types/subsample";

export function IpsosContacts({ subsample }: { subsample: Subsample }) {
  const { scenario } = usePrototypeState();
  let contacts = getIpsosContacts(subsample);
  if (scenario === "ipsos-one" || scenario === "ipsos-many") contacts = [
    { name: "Alex Morgan", email: "alex.morgan@example.test" },
    ...(scenario === "ipsos-many" ? [{ name: "Taylor Chen", email: "taylor.chen@example.test" }, { name: "Project support", email: "project.support@example.test" }] : []),
  ];
  if (scenario === "ipsos-none") contacts = [];
  return <section aria-label="Ipsos Contacts" className="space-y-1">
    <h2 className="text-sm font-medium">Ipsos Contacts</h2>
    {contacts.length ? <ul className="space-y-3">{contacts.map(contact => <li key={contact.email} className="flex items-center gap-2">
      <div className="min-w-0">{contact.name && <p className="text-sm font-medium">{contact.name}</p>}<a href={`mailto:${contact.email}`} className="break-all text-sm text-muted-foreground underline-offset-4 hover:underline">{contact.email}</a></div>
      <CopyValue value={contact.email} label={contact.email} />
    </li>)}</ul> : <p className="text-sm text-muted-foreground">No Ipsos contacts are available for this subsample.</p>}
  </section>;
}
