import { notFound } from "next/navigation";
import { ContactsPanel } from "@/features/subsamples/components/contacts-panel";
import { getSubsampleWorkspaceData } from "@/features/subsamples/data/get-workspace-data";
import { getContactOptions } from "@/services/supplier-service";
import { emptyContacts } from "@/features/contacts/contact-model";

export default async function SubsampleContactsRoute({
  params,
}: {
  params: Promise<{ projectId: string; subsampleId: string }>;
}) {
  const { projectId, subsampleId } = await params;
  const workspace = await getSubsampleWorkspaceData(projectId, subsampleId);
  if (!workspace) notFound();

  const defaults = workspace.supplier.settings.contacts ?? emptyContacts();
  const options = await getContactOptions(workspace.user.supplierId);
  return (
    <ContactsPanel
      canEditDefaults={workspace.user.role === "admin"}
      defaults={defaults}
      options={options}
      subsample={workspace.subsample}
    />
  );
}
