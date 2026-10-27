export const subsampleScenarios = {
  details: [
    ["populated", "Standard Details", "Shows complete attributes and metrics."],
    ["minimal", "Minimal Details", "Shows missing optional information."],
    ["empty", "Empty Details", "Shows when details are unavailable."],
  ],
  "field-progress": [
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
    ["defaults", "Using Default Contacts", "Shows contacts inherited from the supplier."],
    ["custom", "Custom Contacts", "Shows independent contact selections."],
    ["empty", "No Contacts", "Shows an explicit empty contact selection."],
  ],
  configuration: [
    ["defaults", "All Defaults", "Shows settings inherited from the supplier."],
    ["overrides", "Several Overrides", "Shows custom redirects with inherited security and endpoints."],
    ["custom", "Fully Customized", "Shows independent settings in each section."],
    ["empty", "No Configuration", "Shows a section with no configured values."],
  ],
} as const;
export type ScenarioTab = keyof typeof subsampleScenarios;
export function scenarioTab(path: string): ScenarioTab | undefined {
  const match = path.match(/^\/projects\/[^/]+\/subsamples\/[^/]+\/(details|field-progress|costs|contacts|configuration)$/);
  return match?.[1] as ScenarioTab | undefined;
}
