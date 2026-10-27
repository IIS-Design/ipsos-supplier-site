"use client";

import { usePrototypeState } from "@/components/prototype-state";
import { ScenarioEmpty } from "./scenario-preview";
import type { Subsample } from "@/types/subsample";

function ConfigurationSummary({ subsample }: { subsample: Subsample }) {
  const flags = subsample.configurationSummary;
  const yesNo = (value: boolean | undefined) =>
    value === undefined ? "Not provided" : value ? "Yes" : "No";
  const onOff = (value: boolean | undefined) =>
    value === undefined ? "Not provided" : value ? "On" : "Off";
  const items = [
    { label: "Custom CPI", value: yesNo(flags?.customCpi) },
    { label: "Custom Redirects", value: yesNo(subsample.settingsOverrides?.redirects?.mode === "override") },
    { label: "Custom Contacts", value: yesNo(subsample.settingsOverrides?.contacts?.mode === "override") },
    { label: "Personal Identifiable Info (PII)", value: onOff(flags?.personalIdentifiableInfo) },
    { label: "Facial Coding", value: onOff(flags?.facialCoding) },
    { label: "Marketplace Enabled", value: onOff(flags?.marketplaceEnabled) },
  ];

  return (
    <section
      aria-labelledby="configuration-summary-heading"
      className="min-w-0 border-t pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"
    >
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground" id="configuration-summary-heading">
        Configuration Summary
      </h2>
      <dl className="mt-5">
        {items.map((item) => (
          <div className="flex items-start justify-between gap-4 border-b px-2 py-3" key={item.label}>
            <dt className="text-sm font-medium">{item.label}</dt>
            <dd className="shrink-0 text-sm text-muted-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="wrap-break-word text-sm text-muted-foreground">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function DetailsPanel({ subsample: original }: { subsample: Subsample }) {
  const { scenario } = usePrototypeState();
  if (scenario === "empty") return <ScenarioEmpty title="No subsample details available" message="Details will appear when this subsample is configured." />;
  const subsample = scenario === "populated" ? { ...original, router: original.router || "Main Router", invoiceEntity: original.invoiceEntity || "Ipsos Interactive Services", ipsosContact: original.ipsosContact || "supplier.support@example.test" } : scenario === "minimal" ? { ...original, router: null, invoiceEntity: undefined, ipsosContact: undefined, configurationSummary: undefined } : original;
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <section aria-labelledby="subsample-details-heading">
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="subsample-details-heading"
        >
          Subsample Details
        </h2>
        <dl
          aria-label="Subsample field metrics"
          className="mt-8 mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <div>
            <dt className="text-sm text-muted-foreground">Visitors</dt>
            <dd className="mt-1 text-3xl font-medium tabular-nums">
              {subsample.visitors}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Completes</dt>
            <dd className="mt-1 text-3xl font-medium tabular-nums">
              {subsample.achievedCompletes}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Incidence</dt>
            <dd className="mt-1 text-3xl font-medium tabular-nums">
              {subsample.incidence}<span className="text-sm font-normal text-muted-foreground">%</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">LOI</dt>
            <dd className="mt-1 text-3xl font-medium tabular-nums">
              {subsample.loi}<span className="text-sm font-normal text-muted-foreground"> min</span>
            </dd>
          </div>
        </dl>
        <dl className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <DetailField label="Field Start Date" value={formatDate(subsample.fieldStartDate)} />
            <DetailField label="Field End Date" value={formatDate(subsample.fieldEndDate)} />
          </div>
          <DetailField label="Language" value={subsample.language} />
          <DetailField label="Router" value={subsample.router} />
          <DetailField label="Invoice Entity" value={subsample.invoiceEntity} />
          <DetailField label="Ipsos Contact" value={subsample.ipsosContact} />
        </dl>
      </section>
      <ConfigurationSummary subsample={subsample} />
    </div>
  );
}
