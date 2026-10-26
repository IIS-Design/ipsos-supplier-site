# AI handoff — read first

Human-facing project entry point: [README.md](../../README.md). This handoff remains
the primary onboarding document for AI agents.

Verified against source on 2026-10-23. This is a running Next.js prototype, not the
earlier docs/data-only foundation. Prefer current code over historical summaries,
screenshots or session memory. No business-data persistence exists outside one process.

## What a new AI must know before making changes

1. Read root `AGENTS.md`: this Next.js version has local documentation in
   `node_modules/next/dist/docs/`. Check relevant APIs before editing; error boundaries
   receive `retry` here. Do not replace it based on older Next.js knowledge.
2. Read this file, [feature-status.md](feature-status.md), [known-issues.md](known-issues.md)
   and the domain-specific document. This is the current-state index, not a roadmap.
3. Projects is the only landing workspace. Dashboard is removed. Project entry is
   a redirect, not a placeholder. Subsamples are the operational entity.
4. Keep exactly `admin` / `user` roles and the three report types. Visual references
   include unsupported concepts; screenshots do not authorize additional scope.
5. Settings implements all six supplier sections with mock saves/user actions; read
   [settings.md](settings.md). Field Progress is implemented. Subsample Configuration
   and Docs remain placeholders. Reports queue creation is not execution.
6. Read the current file before edits; formatting/user changes can invalidate patches.
7. Do not remove prototype information; use the reusable floating Prototype Tools pattern.
8. Do not persist real data/passwords or imply that passing builds makes mock auth production-safe.

## Stack and commands

- Declared versions: Next 16.4.2, React 19.3.1, TypeScript 5.9.3 strict, Tailwind 4.3.3,
  ShadCN-style Radix primitives, Lucide, RHF 7.90, Zod 4.6.7, Sonner 2.0.8, tsx tests.
- `npm install`; `npm run dev`; `npm run build`; `npm run start` (after build).
- Checks: `npm run test:contacts` (11 TAP results incl. parent), `npm run test:recovery`
  (8 tests), `npm run typecheck`, `npm run lint`, `npm run build`.
- Tests run Node's test runner with `--conditions=react-server --import tsx`.
  No committed browser-test runner/configuration; prior browser checks were manual.
- `.env.example` documents `MOCK_AUTH_SECRET`. Production session operations throw
  without it; development uses a fixed fallback. Do not log secrets or reset URLs.
- `@/*` maps to `src/*`. Tailwind v4 `max-w-300` and `wrap-break-word` are valid;
  do not report them as unsupported v3 utilities.
- Prior checks passed after branding; this documentation-only pass does not rerun
  builds/tests or claim new runtime certification.

## Architecture / file map

| Location                                                                          | Responsibility                                                              |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/app/(auth)`                                                                  | Public auth layout and login/recovery pages                                 |
| `src/app/(portal)`                                                                | `requireUser()` layout, operational pages; Settings has Admin layout        |
| `src/app/api`                                                                     | Authenticated mutation handlers and public mock-auth/recovery endpoints     |
| `src/features/projects`, `subsamples`, `reports`, `costs`, `settings`, `contacts`, `account` | Domain components, shared contact model, workspace data loader              |
| `src/components/ui`                                                               | Local primitives; check actual props (Button sizes only default/sm)         |
| `src/components/auth`, `portal`                                                   | Auth forms/provider, session-facing shell/navigation                        |
| `src/services`                                                                    | Typed repository wrappers; report creation metadata; recovery orchestration |
| `src/lib/repositories`                                                            | Contracts and adapter selection; JSON validation and mock state             |
| `src/lib/auth`                                                                    | Session signing and mock recovery token/password store                      |
| `src/types`, `src/data`                                                           | Domain contracts and JSON seed data                                         |
| `public/logos`, `public/mock-reports`, `public/emails`                                             | Logo, synthetic CSV and four reusable HTML email assets                             |
| `docs/references`                                                                 | Visual guidance, not authoritative feature inventory                        |

Server pages read services → repository contracts → mock adapter; interactive
clients call route handlers. Services are mostly thin wrappers, not universal
authorization gates. APIs and mutation repositories enforce actor/supplier rules.
Auth recovery has its own process-local store rather than a PortalRepository.

## Routes

See [navigation.md](navigation.md) for full page/API tables. Key routes:

- `/` → `/projects`; `/login` → `/projects` when already signed in.
- Public recovery: `/forgot-password`, `/forgot-password/confirmation`,
  `/email-preview/reset-password`, `/reset-password?token=…`, `/reset-password/success`.
- Protected `/projects`, `/reports`, `/reports/create`, `/costs`, `/docs`.
- `/projects/[projectId]` → same Project `/subsamples` list.
- `/projects/[projectId]/subsamples/[subsampleId]` → `/details`; siblings:
  `/field-progress`, `/costs`, `/contacts`, `/configuration?section=…`.
- Admin-only `/settings` renders Organization profile; `/settings/users` includes Contacts below User Management; `/settings/[section]`
  renders Users, Survey Configuration, Redirects, Server-to-Server or Security. `/docs` and Configuration subsection content are placeholders.

## Repository contracts and runtime state

`src/lib/repositories/index.ts:getRepositories()` returns `mockRepositories`.
Contracts in `contracts.ts`:

- Suppliers: list/get, `listContactOptions`, `saveContactDefaults` (Admin actor).
- Users: list/get by supplier, normalized email lookup, authenticated self-profile save.
- Projects: supplier-scoped list/get; no write methods.
- Subsamples: list/listByProject/get, `saveContacts` (supplier actor + parent check).
- Reports: list/get/create; no executor/status-update/retry method.
- Costs: list/get/`decideMany`; validates same-supplier Admin and every selected
  record pending before any mutation. API accepts 1–100 IDs, decision, optional note.
  UI does not collect notes. No undo/edit operation exists.

`fixture-store.ts` imports six JSON files, parses strict Zod arrays and checks
unique IDs, supplier ownership, parent/scoped references, requester/approver and
approval-status consistency. Base fixture counts: suppliers 1, users 2, projects 50,
Subsamples 180, reports 4, costs 8. Do not infer runtime counts from fixtures after tests.

Global mock state keys:

- `__ipsosSupplierMockReports`, `__ipsosSupplierMockCosts` — mutated lists.
- `__ipsosAccountUsers` — saved self-service/managed users and statuses; `__ipsosReportSequences` — report ID reservations.
- `__ipsosSupplierContacts` — cloned suppliers/Subsamples and role contact options.
- `__ipsosMockRecovery` — recovery store instance with tokens/inboxes/password hashes.
  Navigation/reload/HMR may retain state; restart resets all process-local changes.
  No API writes JSON. Newly added modules/interfaces have previously required a clean
  `next dev` restart when HMR served stale methods/routes despite a passing build.

## Services

- `supplier-service.ts`: `listSuppliers`, `getSupplier`, contact options/default save.
- `user-service.ts`: supplier user reads and authenticated self-profile save.
- `project-service.ts`: supplier Project list/get.
- `subsample-service.ts`: list/get/by Project, contact override save.
- `report-service.ts`: list/get; create adds a RPT-YYYY-NNNN identifier, queued status and creation timestamp.
- `cost-service.ts`: list/get and decision delegation.
- `password-recovery-service.ts`: existing-user lookup, request/inbox/token/reset/password check.

## Domain and inheritance

- Branded internal IDs distinguish ProjectId/SubsampleId and external SurveyEventId/
  JobBookNumber. Never infer parentage from event numbers.
- `Subsample.projectId` is canonical. Derive children; do not duplicate child ID lists.
- Costs/Reports have discriminated Project-or-Subsample scope with exactly one target.
- Explicit supplierId is the ownership boundary. Single-supplier seed data is not a
  reason to omit checks. Status unions and type locations: [domain-model.md](domain-model.md).
- Contact inheritance is **Supplier → Subsample**, no intermediate Project layer.
  Missing or inherit mode resolves current defaults. Override mode stores role ID arrays;
  empty means no contacts, never fallback. Replacing defaults preserves old immutable
  options so custom values remain independent. Save commits mode and selections;
  Cancel restores the saved draft baseline. See [contact-inheritance.md](contact-inheritance.md).
- Only directly Subsample-scoped costs appear in its Costs tab; no Project allocation.

## Authentication

- Mock users: `admin@supplier.com`, `user@supplier.com`. Before reset, any non-empty
  password ≤128 chars works; after reset only the saved mock password works until restart.
- Custom two-part HMAC-SHA256 token (not a JWT/JWS implementation), containing
  userId/supplierId/expiresAt. HttpOnly SameSite=Lax cookie; Secure in production;
  8 hours normally, 30 days remembered. User is re-resolved from the repository.
- Settings and cost decisions are Admin-only. Both roles save owned Subsample Contacts
  and create reports. Non-admin Settings navigation redirects to Projects.
- Recovery: neutral request response; browser receipt selects a simulated email preview;
  60-minute single-use random token, hash lookup, superseding requests, scrypt password
  hash. Expired/invalid tests do not consume the normal valid link. Reset clears the
  current browser session only. Read [authentication.md](authentication.md) before auth edits.

## Established UX / product decisions

- Preserve operational enterprise layouts; no new dashboard, marketing UI or invented roles.
- Reports: three types only; History currently includes active records as well as
  processed ones; Queue is queued/executing subset. Date selector exists (3 months/all).
- Project entry uses All Subsamples; no separate overview needed to repair navigation.
- Subsample Costs is informational; decisions live in main Costs with modal confirmation.
- Success: Reports passes returned ID via `created` query for verified confirmation;
  Costs announces count/outcome. In-dialog decision errors retain selections.
- Draft protection is shared `useUnsavedChanges` (still under `features/contacts`),
  used by Contacts, Organization Contacts and report options. Supported custom
  navigation/sign-out dispatches `contacts:before-navigation`; successful report
  submission releases the guard immediately. Native confirms and popstate are not
  a fully tested router blocker.
- RHF 7.90 merges resetOptions into reset(): editors using keepDirtyValues=true
  explicitly pass `{ keepDirtyValues: false }` on Save/Cancel. Do not remove this.
- IpsosLogo uses supplied PNG (32px header, 56px authentication). Authentication
  centers one horizontal logo/Supplier Site row above the existing card. Login and
  both Reset fields use shared `components/ui/password-input.tsx` visibility controls.
  Prototype Tools is a subtle bottom-right Wrench Popover opening upward. Login
  defaults collapsed; recovery confirmation defaults expanded and contains Open Reset Password Email. No prototype toasts/session deduplication. Downloads do not open informational Tools panels.
  Authentication support copy sits below the cards in the shared layout. Keep operational errors,
  success, email copy and intentional email preview labels separate from prototype boilerplate.

## Documentation Rules

The following files are living documents in `docs/ai-context/`:

- prototype-status.md
- known-issues.md
- feature-status.md
- handoff.md
- navigation.md
- authentication.md
- design-system.md
- domain-model.md

Rules:

1. Documentation must always reflect implementation reality. Describe absent
   behavior as absent; never turn intended design or screenshots into shipped features.
2. Update documentation as part of the **same task** that changes behavior.
3. Documentation updates must not be deferred.
4. Whenever implementation changes occur, review **all documentation files** and
   determine which require updates, including README, dev-rules and focused guides.
   Review README whenever features, routes, workflows or architecture change; update
   its human-facing overview in the same task when affected.
5. If changes are required, update the documents and explain why. Keep feature
   statuses, routes, examples, fixture facts and known issues synchronized.
6. If no documentation changes are required, explicitly state:
   **No documentation updates required.**
7. Every implementation task must end with a section titled exactly:

   # Documentation Updates

   List **Files updated** and **Reason for update**, or state
   **No documentation updates required.**

Before handoff, remove fixed findings from known-issues, retain scope limitations,
and distinguish source verification from tests actually run. New behavior must not
remain documented only in a chat response or agent memory.

## Prototype Tools and email preview update

`components/prototype-tools.tsx` replaces help with action-oriented Prototype Tools:
bottom-right, upward Popover, dismiss/reopen, primary-action count badge (not unread
mail). Login exposes Valid Credentials only (collapsed); confirmation/reset expose Open
Reset Password Email; Password Updated exposes Open Password Changed Email; Reports
exposes Open Sample Report. Pages without relevant actions do not show Tools. Account Created/Invitation assets have no UI workflow yet. Confirmation
starts expanded. Badge sits before the label, red with white count, accessible
description/live announcement, and one 4-second text shimmer (disabled for reduced motion).
`/forgot-password/inbox` was removed. `/email-preview/[template]` serves allowlisted
HTML templates in new tabs with private/no-store, no-referrer/noindex and CSP.
Reset uses `ipsos_prototype_email` (HttpOnly, Path=/email-preview, 24h) and the latest
process-local recovery receipt. Internal recovery store still calls this collection
`inboxes`; this is storage naming, not an inbox UI. Expired/invalid links remain direct test routes, not Tools actions.
All four templates are in `public/emails/` with integration README. Other previews
use sample data; invitations can be staged in Settings but have no acceptance or SMTP. Shared authentication
field errors use `components/ui/field-error.tsx`.

Email template checks: `npm run test:emails` (2 tests: all four renders/escaping,
unsafe links and missing values). Full current suites total 21 TAP results including
the Contacts parent. Build uses `next build --webpack` in this environment because
Turbopack worker-port binding was restricted in the preceding validation session.

## Projects refinement / fixtures

Projects uses `ProjectsWorkspace` / `ActivityPanel` with line Costs/Reports tabs and
horizontal sidebar collapse. The PanelLeft trigger switches 340px/48px columns. Only one
widget is visible; desktop columns start at 1280px, tablet stacks. Main filters are
container-aware (single row at desktop with >=640px available; graceful wrapping below).
Header primary links are text-only; below 1024px use hamburger navigation expanding
below the header. Shared Input owns native date icon alignment; Projects uses a single DateRangePicker. Shared Select/Popover
styles and semantic tokens now cover contrast, focus/hover, spacing and layering.
A shared Radix DropdownMenu supports the user menu; no independent Command implementation exists.
Fixtures: 50 Projects (20 Live/14 Pending/9 Closed/7 Canceled), 180 Subsamples; see
prototype-status for child-count/edge coverage. Original records are preserved.
Dev HMR appends new seed children without resetting saved contacts. Four email
footers consistently show Ipsos Supplier Site and © 2026 Ipsos on separate lines.

Projects refinement validation: 21 TAP results passed (Contacts/recovery/email assets),
ESLint and TypeScript passed, webpack production build passed. Browser checks at
1440px desktop, 1024px/768px tablet and 390px mobile covered overflow, filter wrapping,
inline navigation, language dropdown visibility, Pending/search, Activity switching
and collapse. These are manual checks, not committed browser automation.

## Projects list controls / surface update

ProjectsExplorer owns row expansion and pagination. Default page size 10; choices
10/20/50. Filter/view/page-size edits reset page one. Expand/Collapse All applies to
all filtered Projects across pages, reusing controlled ProjectGroup/Collapsible.
Collapsed Activity retains selected tab and a rail; it is inert/aria-hidden, with
width-only transitions and reduced-motion support. Desktop recovers Projects width;
tablet stacks Projects above Activity, hides the toggle and always shows content. No vertical accordion.
PortalShell sets a white background token; authentication stays light gray. Mobile
menu includes user/role first and Sign Out last, separated from primary text links.
Subsample summaries use muted labels/full foreground values. Shared dropdown long
text and focus treatment were refined. Existing 50/180 fixtures and fixed email
footers already satisfy this pass; no data/identity changes were needed.

Latest Projects alignment validation: ESLint, TypeScript/webpack production build and
21 existing TAP results passed. Manual browser checks verified 10/20/50 sizes,
page boundaries, filter page reset, expansion across pages, Activity 340px→48px
collapse and tab persistence, white/gray route surfaces, mobile menu hierarchy,
long-option Select and Contacts Popover bounds/contrast. Checked 1440px desktop,
768px tablet and 390px mobile. These new interaction checks are not automated.

## Projects refinement: compact controls

Projects now uses a shared DateRangePicker with one flat trigger, keyboard calendar
navigation and explicit Apply/Cancel/Clear dates. Reversed endpoints are normalized;
only complete ranges commit. Filtering still uses Subsample field-end dates.
Search/Language/range fit one row at 640px available explorer width and wrap below.
Shared formControlStyles makes Input, Select, Contacts combobox and range triggers
40px high without shadows. Native date icons remain aligned right.
Projects use compact white bordered cards; Subsamples use soft tree guides; Expand/Collapse All reuse
row chevrons. Summary labels are muted and values use default foreground.
Activity has no visible heading: its line tabs and PanelLeft toggle share one row,
retaining horizontal collapse and tab state. Widget title dividers are removed.
Desktop account controls use a name/role dropdown; mobile Sign Out retains
its icon. No fixture, authorization or workflow changes.

## Costs-first Activity, date presets and hierarchy

Activity defaults to Costs, then Reports. At 1280px+ the PanelLeft toggle keeps
horizontal collapse without a vertical separator beside the toggle. Below 1280px the
panel always displays content and hides the toggle/separator, including after a
collapsed desktop panel is resized. Desktop collapse state is retained on return.
Projects DateRangePicker opens a preset list first: Last Month, Last 3/6/12 Months,
This Year and Custom Range. Month presets use complete previous calendar months;
This Year is January 1 through today, using local dates. Only Custom Range opens
the calendar; Apply/Cancel/Clear behavior is retained.
Expanded Subsamples use compact indented tree rows with a subtle vertical guide
and short branches, with metrics closer to the name. Project expansion is unchanged.
Prototype Tools keeps its accessible red left badge and uses a single 4-second
ShadCN-style text shimmer when action identity becomes available. It stops by itself,
does not replay on panel reopening and respects reduced motion.

## Projects visual refinement

Projects are compact white cards with light borders, small radii, internal padding
and an 8px gap; expansion, filtering and paging are unchanged. Expanded Subsamples
retain soft indented tree guides. Status leads the compact metrics row, with subtle
dot separators; labels stay muted and values use foreground. Achieved is omitted from the Projects summary; Remaining displays the total of
exclusive and shared capacity.
Custom Range now has month/year selects (100 years back, 20 forward from the current
year, extended for the visible month) and Today navigation. Today focuses today's
date without changing the selected range. Presets and custom Apply/Cancel remain.
Clear Dates appears only for a committed range. Standard Separator components divide
footer actions, replacing the border applied to a rounded button.
Prototype notification attention is badge-only: one 4-second text shimmer, triggered
by action availability identity, with no looping/replay on popover reopening. The
Tools label remains static and reduced motion disables animation.

## Projects advanced filters

Search, Language and Date Range remain visible. A Filters button opens a modal
ShadCN-style Sheet on the right (full width below 640px), with Subsample Status
(Any/Live/Pending/Canceled) and Remaining (Any/0/1–50/51–200/200+). Country, Router
and Incidence filters are not implemented in this pass.
Advanced changes apply immediately, combine with existing filters and reset page
one. A Project remains only if at least one Subsample matches all filters; its
expanded list/count includes those matches. Remaining combines exclusive and shared
capacity. Buckets are non-overlapping: 200 belongs to 51–200; 200+ means >200.
Filters shows an active advanced-filter count. Reset advanced filters preserves
Search/Language/Date Range; Clear Filters resets all filters. Closing with Done,
Escape, close button or overlay preserves choices and restores trigger focus.
Sheet focus is trapped; Select overlays render above the Sheet. Project expansion
state remains intact. Boundary/status-composition tests live in project-filters.test.ts.
Activity Costs/Reports retain text-width active underlines; Pending Cost Approvals
keeps its title/badge and no longer displays the currency icon.

## Projects scanability refinement

Activity's vertical separator is removed; Costs/Reports text-width line tabs and the
desktop horizontal-collapse toggle remain. View All and Review Costs are secondary
outline buttons retaining /reports and /costs destinations. Create New Report keeps
/reports and its existing icon, with no caret or dropdown affordance.
Live/Pending is a single bordered segmented-view selector, with short labels and
count badges, aria-pressed state, and no View label. Behavior is unchanged.
Subsample summary metadata is limited to Status, Language, Field End Date, Incidence
and Remaining, in that order. Achieved is omitted here. Remaining displays total
exclusive plus shared capacity; detailed breakdown remains on the Subsample view.
Each metric pair stays together; the row wraps naturally without a forced Remaining
line. Search/Language/Date Range remain visible; only advanced Status/Remaining
filters live in the Sheet.

## Action-only Prototype Tools

Tools exposes only useful page-specific actions, never persistence/repository/mock
implementation paragraphs. Login shows Valid Credentials and the two account emails.
Confirmation contains only Open Reset Password Email. Reports offers Open Sample
Report and Show Empty Reports State; Costs offers Show Empty Costs State. No Tools
trigger appears on pages with no relevant actions. Link-state actions and automatic
report-download guidance have been removed.
Empty previews use pathname-scoped local React context, with no storage, server
requests or fixture mutation. Tools offers Restore for both modules; only Reports also shows an inline preview notice with Restore
Reports/Costs. Leaving the page or reloading clears the preview; restoring retains
module filters/tab state. See prototype-messaging.md for the complete action matrix.

## Projects title / Activity preview alignment

The primary segmented selector follows Projects immediately in the title row, with
Live Projects/Pending Projects labels and existing counts. On narrow screens the
row may wrap naturally. Filtering, paging and expansion behavior is unchanged.
Projects Tools groups actions under Reports and Costs. Show Empty Reports State
and Show Empty Costs State independently swap the respective Activity widget to
its empty state; each action becomes Restore Reports/Costs while active. Both can
be previewed together. Project/Subsample rows remain unchanged. State is local,
resets on pathname navigation/reload and never modifies fixtures or repositories.
Other screens retain their established contextual actions. No Dashboard route is
introduced: Projects remains the landing workspace. Activity still has no vertical
separator, metadata remains Status/Language/Field End Date/Incidence/total Remaining,
and its footer actions retain white outline buttons with original destinations.

## Activity action placement

The desktop PanelLeft collapse/expand control precedes the Costs/Reports tabs on
the left of the Activity header; stacked layouts still hide it. Recent Reports
places Create New Report then View All together in its footer on one row, for both
normal and empty states. Both retain their existing /reports destinations.

## Activity report interactions and widget limits

Recent Reports shows the newest 10 by createdAt; Pending Cost Approvals shows the
first 10 pending records in existing order, with its badge counting all pending
records. Neither widget paginates. View All/Review Costs remain available.
Queued/executing report names and icons navigate directly to /reports?view=queue.
Finished names/icons use native download links to the existing synthetic CSV.
Errors keep compact name/status/metadata rows; the accessible error icon opens
shared ReportErrorDetails on hover, click or keyboard activation, with Escape/
outside dismissal. Full errors are not rendered inline, including Reports history.
Report fixture IDs use RPT-2026-1044 through RPT-2026-1047. New report IDs use
RPT-YYYY-NNNN (at least four digits) with synchronous process-local reservation,
seeded above fixture numbers for that year. This shares the mock lifecycle; a
production adapter requires durable atomic ID allocation. The renamed sample asset
is /mock-reports/RPT-2026-1045.csv, with content/download behavior unchanged.
Projects-only Activity empty previews remain independent, reversible and local;
fixtures/repositories are unaffected by those actions. No Dashboard route added.

## Entity typography hierarchy

Global body remains 14px. Projects list names and their Project: prefix are 18px/400. Subsample names in
Projects/All Subsamples and the workspace heading/selector are 16px/500. Report
names in the Activity widget, History/Queue and creation-page heading
are 16px/500; generic page/section headings retain their existing hierarchy.
Project/Subsample and Reports row metadata is 14px, including language, field-end
date, incidence, remaining and status. Pending-cost scope names on Projects use
16px/500 and their metadata 14px. No padding, margins or gap sizes are increased;
existing compact line heights and natural wrapping accommodate the type hierarchy.

## Project label and long cost-name alignment

Project: and its Project name share 18px regular typography in the Projects list.
Pending cost rows reserve a nonshrinking, single-line amount column. Scope names
truncate with ellipsis in the remaining width; a native title exposes the full name.
Two new pending fixture costs (cost-007/008) reference long-named Projects, including
a longer Brand Awareness fixture name. Project count and existing cost records/values
are unchanged; the pending fixture count is now six.

## Account Settings

/account is available to both roles from the name/role desktop dropdown and the
mobile hamburger. Desktop Sign Out is inside the dropdown; mobile Account Settings
follows Settings (or Docs for Users) with the same navigation styling. A single
separator divides Account Settings from the icon Sign Out action at the bottom.
Line tabs provide Personal Information (first/last name, email; Save/Cancel, validation,
unsaved-change protection and async feedback) and Security (masked Password, Change
Password via the existing recovery-email flow). PUT /api/account only edits the
session actor, rejects protected fields and duplicate emails, and refreshes header
identity. Profile storage is process-local. Email changes preserve password hashes
and invalidate old reset links. No additional security/session-management features.
See account-settings.md for API behavior, constraints and validation.

## Supplier Settings expansion

All six reference sections are implemented behind the existing Admin guard. See
[settings.md](settings.md) for routes, API/adapter contracts, mock lifecycle, validation,
reference deviations and verification. `__ipsosSupplierPreferences` stores per-supplier
preferences; users reuse `__ipsosAccountUsers`. Invited/inactive users cannot sign in
or use an existing session. Integration keys are synthetic; Subsample Configuration
and non-contact inheritance remain unimplemented. Current complete suite: 30 TAP results.
