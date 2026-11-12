export const subsampleScenarios = {
  details: [
    ["populated", "Standard Details", "Shows complete attributes and metrics."],
    ["ipsos-many", "Multiple Ipsos contacts", "Shows a list of Ipsos contacts with email copying."],
    ["ipsos-none", "No Ipsos contacts", "Shows details without assigned Ipsos contacts."],
    ["multilingual", "Multiple languages / IDs", "Shows Canada, two languages and a subsample-specific JBN and Research Type."],
    ["minimal", "Minimal Details", "Shows missing optional information."],
  ],
  "field-progress": [
    ["metrics-complete", "Actual vs Expected", "Shows all four metrics with positive, negative and zero differences."],
    ["metrics-missing", "Missing Expected / Abandon", "Shows unavailable estimates and Abandon as dashes."],
    ["metrics-zero", "Zero Visitors", "Shows unavailable Conversion without dividing by zero."],
    ["quotas-combined", "Separate and Combined Quotas", "Shows age, gender and a combined age × gender table."],
    ["healthy", "Healthy Progress", "Shows active fieldwork with quota results."],
    ["low", "Low Incidence", "Shows many visitors and few completes."],
    ["nearly", "Nearly Complete", "Shows a small remaining target."],
    ["no-quota", "No Quota Data", "Shows metrics without a quota breakdown."],
    ["empty", "Empty Progress", "Shows when fieldwork has not started."],
  ],
  costs: [
    ["published", "Show Cost Summary", "Displays a published cost record."],
    ["empty", "Show Empty State", "Displays a Subsample with no direct cost records."],
    ["discounted", "Discounted Costs", "Shows a published total with an API discount."],
    ["pending", "Pending Costs", "Shows submitted costs awaiting publication."],
    ["rejected", "Rejected Costs", "Shows a rejected cost record."],
  ],
  contacts: [
    ["ipsos-one", "One Ipsos contact", "Shows one read-only contact with email copying."],
    ["ipsos-many", "Multiple Ipsos contacts", "Shows several Ipsos contacts without changing supplier recipients."],
    ["ipsos-none", "No Ipsos contacts", "Shows an empty Ipsos contact list."],
    ["defaults", "Using Default Contacts", "Shows contacts inherited from the supplier."],
    ["custom", "Custom Contacts", "Shows independent contact selections."],
    ["empty", "No Contacts", "Shows an explicit empty contact selection."],
  ],
  security: [
    ["security-rules", "Rules example", "Shows the read-only Research Type × Client reference."],
    ["security-many", "Many rules", "Shows several rules to test expand/collapse all."],
    ["security-empty", "No rules", "Shows a subsample without rules."],
  ],
  links: [
    ["links-single", "Single language", "Shows one language with both link types."],
    ["links-no-live", "Missing live link", "Shows a testing link before a live link is available."],
    ["links-long", "Long URLs", "Checks wrapping and copying long entry URLs."],
    ["links-multiple", "Multiple languages", "Shows Live and Testing links for Canadian English and French."],
    ["links-partial", "Missing testing link", "Shows a language without its testing link."],
    ["empty", "No links", "Shows no entry links."],
  ],
  configuration: [
    ["defaults", "All Defaults", "Shows settings inherited from the supplier."],
    ["overrides", "Several Overrides", "Shows custom redirects with inherited security and endpoints."],
    ["custom", "Fully Customized", "Shows independent settings in each section."],
  ],
} as const;
export type ScenarioTab = keyof typeof subsampleScenarios;
export function scenarioTab(path: string): ScenarioTab | undefined {
  const match = path.match(/^\/projects\/[^/]+\/subsamples\/[^/]+\/(details|field-progress|costs|contacts|configuration|links|security)$/);
  return match?.[1] as ScenarioTab | undefined;
}

export const reportScenarios = [
  ["reports-duplicate", "Duplicate request", "Shows an informational toast linking to an existing queued report. No duplicate detection runs."],
  ["reports-unavailable", "File no longer available", "Shows a finished job whose file is unavailable, with an action to create a new report."],
  ["reports-all", "All report statuses", "Shows queued, executing, downloadable and failed Member Info reports."],
  ["reports-queued", "Queued", "Shows a report waiting to be processed."],
  ["reports-executing", "Executing", "Shows a report being generated."],
  ["reports-finished", "Ready to download", "Shows a completed report with a sample download."],
  ["reports-error", "Failed", "Shows error details for a failed report."],
  ["reports-empty", "No reports", "Shows the unified report list without records or a preview banner."],
] as const;
