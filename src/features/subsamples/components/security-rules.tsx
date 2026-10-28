/** Display-only examples for UX validation, never enforcement or saved settings. */
export function SecurityRules({ defined, projectId, subsampleId }: { defined: boolean; projectId: string; subsampleId: string }) {
  if (!defined) return <p className="mt-5 text-sm text-muted-foreground">No security rules have been configured for this subsample.</p>;
  const groups = [
    { dimension: "Survey", match: subsampleId, statuses: ["Complete", "Screen Out"], span: "Last 30 days" },
    { dimension: "Research Type", match: "Product testing", statuses: ["Complete"], span: "Last 90 days" },
    { dimension: "Category", match: "Health & Personal Care › Health Care", statuses: ["Complete"], span: "Last 60 days" },
    { dimension: "Job Book", match: "Any survey in the same job book", statuses: ["Complete", "Quota Full"], span: "Last 30 days" },
    { dimension: "Event", match: projectId, statuses: ["Complete", "Screen Out", "Quota Full"], span: "Last 7 days" },
  ];
  return (
    <table className="mt-5 w-full table-fixed text-left text-sm">
      <caption className="sr-only">Effective security filtering rules</caption>
      <thead className="hidden sm:table-header-group">
        <tr className="border-b">
          <th scope="col" className="w-2/5 pb-2 pr-4 font-medium">Dimension / Match Value</th>
          <th scope="col" className="pb-2 pr-4 font-medium">Statuses</th>
          <th scope="col" className="w-1/4 pb-2 font-medium">Time Span</th>
        </tr>
      </thead>
      <tbody className="block divide-y sm:table-row-group">
        {groups.map(rule => (
          <tr key={rule.dimension} className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 sm:table-row">
            <th scope="row" className="col-span-2 min-w-0 text-left font-normal sm:py-3 sm:pr-4 sm:align-top">
              <span className="font-medium">{rule.dimension}</span>
              <span className="mt-1 block wrap-break-word text-muted-foreground">{rule.match}</span>
            </th>
            <td className="min-w-0 wrap-break-word text-muted-foreground sm:py-3 sm:pr-4 sm:align-top">
              <span className="mb-1 block text-xs font-medium text-foreground sm:hidden">Statuses</span>
              {rule.statuses.join(", ")}
            </td>
            <td className="min-w-0 text-muted-foreground sm:py-3 sm:align-top">
              <span className="mb-1 block text-xs font-medium text-foreground sm:hidden">Time Span</span>
              {rule.span}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
