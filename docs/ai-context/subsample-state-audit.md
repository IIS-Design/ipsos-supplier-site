# Subsample Overview state audit

Reviewed the Overview, Details, Field Progress, Costs, Costs-1 (Contacts),
Configuration and Configuration-1/2/3 reference PNGs under `docs/references/`.

## Findings

| Tab | Implementation and reference comparison | Coverage gaps found |
| --- | --- | --- |
| Details | Metrics, paired dates, stacked attributes and six summary fields match the current approved direction. Earlier requested line tabs and metadata order intentionally differ from PNGs. | No way to preview missing optional values or unavailable details. |
| Field Progress | Compact achieved/exclusive/shared rows, adjacent metrics and quota table are implemented. | No reliable per-page controls for low incidence, near completion, not started or missing quotas. |
| Costs | Direct Subsample scope is intentional; Project records do not roll down. Reference uses API Discount, stacked supplier/Ipsos status and publication details. Replaced the compact status card, renamed Discounts, and added publication date display. | 180 Subsamples have only 3 direct records, all pending approval; no published, discounted or rejected direct records. Most Subsamples therefore show empty Costs. Publisher identity is absent from the model, so it cannot display the reference's “By [email]” attribution. Currency remains the product's localized money format. |
| Contacts | Default Contacts, independent custom selections, validation and saves work. | PNG uses Project Manager/Sales/Finance roles, intentionally superseded by the approved flat Default Contacts model. Empty/inherited/custom previews were unavailable. |
| Configuration | Four subsection routes now show populated read-only defaults. | Entry URL and Pixel HTML/endpoints are visible; Copy URL, saving and integrations are not implemented. Read-only previews now expose reference fields and inherited/custom variants; this does not complete their editors or integrations. Security reference only defines “No security rules defined”, so no rules are invented. |

## Contextual Prototype Tools

Every individual Subsample tab offers its own scenarios and Restore Current Data:

- Details: Standard Details, Minimal Details, Empty Details.
- Field Progress: Healthy Progress, Low Incidence, Nearly Complete, No Quota Data,
  Empty Progress.
- Costs: Show Cost Summary, Show Empty State, Discounted Costs, Pending Costs,
  Rejected Costs.
- Contacts: Using Default Contacts, Custom Contacts, No Contacts.
- Configuration: All Defaults, Several Overrides, Fully Customized,
  No Configuration. Several Overrides customizes redirects while endpoints and
  security remain inherited. Fully Customized indicates independent sections;
  security still has no rules because the reference provides none.

Each action explains the visible result. Scenarios are page-scoped React state,
reset on pathname change or reload, with no storage, fixture mutation or write
requests. Configuration query navigation retains its selected scenario. Restore
Current Data returns to actual records. Contact previews are read-only and cannot
save sample contacts. Normal contact drafts retain their existing navigation
protection. All preview URLs use the reserved example.test domain and are not
external integration links.

## Configuration default experience update

Entry Links, Redirects, Server-to-Server and Security now immediately render the
same populated read-only UI previously available through All Defaults. Generic
placeholder and return-to-Details messages are removed. Prototype Tools offers
Show Defaults, a section-specific custom scenario, and Show Empty State; Restore
Current Data returns to the normal defaults UI. Security retains the approved
“No security rules defined” display, including for an independent custom scope;
no unapproved rule fields are introduced. Values remain mock display data with
no configuration save/integration behavior. This supersedes earlier notes that
the normal Configuration view is a placeholder.

## Configuration inheritance controls

Redirects, Server-to-Server and Security now use the shared Switch pattern:
Use Supplier Defaults on shows actual Supplier Settings values read-only;
off exposes editable Subsample-local values with a Custom Override indicator.
Supplier preferences come from the supplier-scoped settings service. Empty
supplier values remain empty rather than being replaced with fabricated URLs.
Security reuses Source Key and masked Secret Key from Supplier Settings.
Entry Links remains system-assigned and read-only, with no toggle/custom action.
Details summary now reports Redirects, Security and Server-to-Server as Supplier
Defaults or Custom. Prototype Tools switches these actual modes per section.
Workspace-local edits survive section/tab navigation, are isolated by Subsample,
and reset on reload/leaving the workspace; no save API or durable persistence is
introduced. Supplier defaults and fixtures remain unchanged. Prototype scenarios
remain route-scoped while configuration state spans the Subsample workspace.
This supersedes the earlier entirely read-only Configuration description.

## Effective Subsample Security (supersedes credential inheritance)

Subsample Security no longer displays Source Key, Secret Key or Use Supplier
Defaults. Integration credentials remain supplier-level concerns and are not
passed into the Subsample configuration provider. Security is a read-only view
of effective filtering with two display states: Rules Defined and No Rules
Defined. The empty state explicitly says no security rules have been configured.
Prototype Tools offers Show Security Rules and Show No Security Rules. Rule
examples group Survey, Research Type, Category, Job Book and Event matches, with
status lists and time spans. These are display-only examples, not fixture edits,
saved configuration or an enforcement engine. The local selection survives
workspace tabs so Details summary agrees, resets for another Subsample/reload,
and does not persist. Redirects/S2S retain their existing inheritance controls.

## Compact Security presentation

Effective Security rules use one lightweight structured table with row separators,
Dimension/Match Value, plain-text Statuses and Time Span. Narrow screens stack
fields within each row with visible labels; there are no per-rule cards or status
badges. The empty state is only “No security rules have been configured for this
subsample.” with no heading, border or icon. Prototype Tools scenarios are unchanged.
