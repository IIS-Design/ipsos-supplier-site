import { Badge } from "@/components/ui/badge";
import type { Subsample } from "@/types/subsample";

type SummaryItem = {
  label: string;
  custom: boolean;
};

function ConfigurationSummary({ subsample }: { subsample: Subsample }) {
  const items: SummaryItem[] = [
    {
      label: "Custom Contacts",
      custom: subsample.settingsOverrides?.contacts?.mode === "override",
    },
    {
      label: "Custom Redirects",
      custom: subsample.settingsOverrides?.redirects?.mode === "override",
    },
    {
      label: "Custom Security",
      custom: subsample.settingsOverrides?.security?.mode === "override",
    },
    {
      label: "Custom S2S",
      custom: subsample.settingsOverrides?.serverToServer?.mode === "override",
    },
  ];

  return (
    <section aria-labelledby="configuration-summary-heading">
      <h2 className="text-sm font-semibold" id="configuration-summary-heading">
        Configuration Summary
      </h2>
      <dl className="mt-3 divide-y rounded-md border px-3">
        {items.map((item) => (
          <div
            className="flex items-center justify-between gap-3 py-3"
            key={item.label}
          >
            <dt className="text-sm font-medium">{item.label}</dt>
            <dd>
              <Badge
                className={
                  item.custom
                    ? "border-blue-200 bg-blue-50 text-blue-800"
                    : "text-muted-foreground"
                }
                variant="outline"
              >
                {item.custom ? "Yes" : "No"}
              </Badge>
            </dd>
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

export function DetailsPanel({ subsample }: { subsample: Subsample }) {
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
      <section aria-labelledby="subsample-details-heading">
        <dl
          aria-label="Subsample field metrics"
          className="mb-6 grid grid-cols-2 gap-4 border-b pb-5 sm:grid-cols-4"
        >
          <div>
            <dt className="text-sm text-muted-foreground">Visitors</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {subsample.visitors}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Completes</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {subsample.achievedCompletes}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Incidence</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {subsample.incidence}%
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">LOI</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {subsample.loi} min
            </dd>
          </div>
        </dl>
        <h2
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          id="subsample-details-heading"
        >
          Subsample Details
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <DetailField label="Subsample ID" value={subsample.id} />
          <DetailField
            label="Status"
            value={
              subsample.status[0].toUpperCase() + subsample.status.slice(1)
            }
          />
          <DetailField label="Name" value={subsample.name} />
          <DetailField label="Language" value={subsample.language} />
          <DetailField label="Router" value={subsample.router} />
          <DetailField
            label="Field Start Date"
            value={formatDate(subsample.fieldStartDate)}
          />
          <DetailField
            label="Field End Date"
            value={formatDate(subsample.fieldEndDate)}
          />
          <DetailField label="Invoice Entity" value={subsample.invoiceEntity} />
          <DetailField label="Ipsos Contact" value={subsample.ipsosContact} />
        </dl>
      </section>
      <ConfigurationSummary subsample={subsample} />
    </div>
  );
}
