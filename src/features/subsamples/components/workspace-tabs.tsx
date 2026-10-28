"use client";

import { useId } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const router = useRouter();
  const currentTab =
    tabs.find((tab) => pathname.endsWith(tab.suffix))?.value ?? "details";
  const base = `/projects/${projectId}/subsamples/${subsampleId}`;

  const selectorId = useId();
  const navigate = (value: string) => {
    const tab = tabs.find((item) => item.value === value);
    if (tab && value !== currentTab && confirmContactNavigation())
      router.push(`${base}${tab.suffix}`);
  };

  return (
    <>
      <div className="space-y-2 lg:hidden">
        <label htmlFor={selectorId} className="text-sm font-medium">Section</label>
        <Select value={currentTab} onValueChange={navigate}>
          <SelectTrigger id={selectorId} aria-label="Subsample section" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{tabs.map(tab => <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    <Tabs
      className="hidden min-w-0 lg:flex"
      onValueChange={navigate}
      value={currentTab}
    >
      <TabsList
        aria-label="Subsample workspace sections"
        variant="line"
        className="h-auto w-full flex-nowrap justify-start gap-x-4 p-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            className="flex-none rounded-none px-0"
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
    </>
  );
}
