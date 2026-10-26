"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { confirmContactNavigation } from "@/features/contacts/use-unsaved-changes";

const tabs = [
  { value: "details", label: "Details", suffix: "/details" },
  {
    value: "field-progress",
    label: "Field Progress",
    suffix: "/field-progress",
  },
  { value: "costs", label: "Costs", suffix: "/costs" },
  { value: "contacts", label: "Contacts", suffix: "/contacts" },
  { value: "configuration", label: "Configuration", suffix: "/configuration" },
] as const;

export function WorkspaceTabs({
  projectId,
  subsampleId,
}: {
  projectId: string;
  subsampleId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab =
    tabs.find((tab) => pathname.endsWith(tab.suffix))?.value ?? "details";
  const base = `/projects/${projectId}/subsamples/${subsampleId}`;

  return (
    <Tabs
      className="min-w-0"
      onValueChange={(value) => {
        const tab = tabs.find((item) => item.value === value);
        if (tab && value !== currentTab && confirmContactNavigation())
          router.push(`${base}${tab.suffix}`);
      }}
      value={currentTab}
    >
      <TabsList
        aria-label="Subsample workspace sections"
        className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted p-1"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            className="flex-none px-3"
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
