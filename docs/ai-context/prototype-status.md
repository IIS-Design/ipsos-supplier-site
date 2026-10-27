# Prototype status

Verified against source on 2026-10-23. Read [handoff.md](handoff.md) first.
This document records implemented behavior, not a delivery plan. `Complete` in
[feature-status.md](feature-status.md) means complete within the current mock slice,
not production readiness.

## Implemented

- Shared authenticated portal shell; Projects is the landing workspace. `/` redirects
  to `/projects`; there is no Dashboard page or compatibility redirect.
- Ipsos logo at 32px in the header and 56px in the authentication layout, in a centered horizontal logo/Supplier Site row. Shared
  floating contextual Prototype Tools, dismissible/re-openable, opens upward from
  bottom-right. Login defaults collapsed; recovery confirmation defaults expanded
  with Open Reset Password Email in Tools. Support copy sits below authentication cards.
- Mock login/logout, signed sessions, Administrator/User navigation restrictions.
  Login and both Reset password fields share accessible Eye/EyeOff visibility controls.
- Password recovery: validated request, neutral confirmation, browser-scoped email
  preview, valid/expired/invalid/single-use links, matching password reset, success page,
  and sign-in with the updated mock password. No real email is sent.
- Projects Live/Pending views; search, language and field-end date filters; expandable
  Project groups with Subsample metrics; recent reports and pending-cost widgets.
- Project route redirects to its existing All Subsamples list. Subsample base route
  redirects to Details. Shared Project context, selector, breadcrumbs and five sections.
- Details displays fixture attributes/metrics and saved custom-setting indicators.
- Field Progress displays achieved/exclusive/shared metrics, Visitors, Incidence,
  LOI and quota rows, with an empty state when quota rows are missing. It is not a placeholder.
- Subsample Costs displays directly scoped cost records, currency/discount values and
  approval/supplier/Ipsos statuses; it is informational, not an approval surface.
- Reports history/queue, search, status filter, Last 3 months/All Time filter, all
  three creation forms/options, server validation, queued creation and success feedback.
  Report drafts warn before supported navigation; failures retain options.
- Existing finished-report download serves a synthetic CSV without an informational Tools notice. No actual respondent export is generated.
- Costs Pending Approval/History, search, pending country filter, status filters,
  History date range, expandable details, selection, confirmation, Administrator
  bulk approve/reject, in-dialog errors and explicit decision-success feedback.
  History uses ten records per page; User accounts are read-only for decisions.
- Settings includes Organization profile and five other sections, with Default Contacts below User Management in Users & Permissions (see settings.md). Default Contacts: one multi-select for portal users and standalone emails, Save/Cancel; validation, loading, retryable route errors and submission feedback.
- Subsample Contacts: saved default/custom mode, custom ID selections, effective
  inherited values, save/cancel, unsaved-change warnings and success/error states.
- Supplier-scoped repositories/services, strict fixture schemas and relationship checks.
- Projects has one Activity panel with line-style Costs/Reports switching and
  horizontal sidebar collapse to a 48px rail; its desktop column width returns to Projects.
  Explorer/Activity are two columns at 1280px+, stacked below. Filters use one
  row when the explorer has 640px, with graceful wrapping below. Navigation is text-only
  on desktop and uses an inline hamburger below 1024px. Date icons align right globally.
- Shared dropdown surfaces, semantic tokens, hover/focus states and layering are
  defined centrally. Costs filters retain their existing wrapping behavior.

## Partial areas

- Reports: creation is queued in memory only; no execution/status progression,
  result generation, polling, failed-report retry or report-parameter inspection.
- Projects: landing only exposes Live/Pending; All Subsamples has read-only cards with project-local search/status/language/router/
  date filters; no editing or cross-project comparison.
- Settings: six supplier sections have complete UI and process-local mock saves/actions; see settings.md.
- Subsample Workspace: four functional fixture-backed sections plus Configuration
  subsection navigation and unavailable-content panels.

## Deferred / absent

- Docs is a protected placeholder with Return to Projects.
- Configuration `entry-links`, `redirects`, `server-to-server`, `security` are navigable
  placeholders; each has Return to Subsample Details. No technical-settings editor/save.
- Settings invitations have no acceptance flow; saved integration settings do not execute external operations.
- No self-registration, MFA, SSO, real mail, external
  integrations, Project-level inheritance or Project cost allocation/aggregation.
  These are absent scope, not implied capabilities.

## Prototype limitations

- JSON fixtures seed one supplier, two users, 50 projects, 180 Subsamples, four
  reports and eight costs. Runtime edits do not rewrite JSON.
- Reports, Costs, Contacts and recovery credentials/tokens use process-local global
  state. They survive navigation/reload in that process, reset on restart and do not
  synchronize between instances. Projects use read-only fixtures; self-service User profiles use process-local storage.
- Default mock sign-in accepts a non-empty password up to 128 characters until that
  account resets it; afterward the new password is required until restart.
- Session signing is not production identity. `MOCK_AUTH_SECRET` is required when
  production session operations execute. No global session revocation or abuse controls.
- Recovery preview deliberately exposes mock delivery; the neutral confirmation does
  not make this inspectable testing environment enumeration-safe for real accounts.
- No live metric refresh, durable persistence, concurrent-edit conflict handling or
  cross-tab push updates. Cost totals/discounts are displayed as supplied, not recalculated.
- Accessibility is an implementation target, not a certification; see [known-issues.md](known-issues.md).

## Prototype Tools / email assets

Action-oriented Tools replaces Prototype Help. Its badge counts primary actions,
not delivered messages. Login offers Valid Credentials; confirmation/reset offers Open
Reset Password Email; Password Updated offers Open Password Changed Email; Reports
offers Open Sample Report. No unrelated actions appear. Account Created/Invitation
templates remain available without invented UI workflows. Red count precedes label
with accessible announcement and a single reduced-motion-aware 4-second text shimmer.
Confirmation retains only two return links.
No Mock Inbox page/workflow remains. `/email-preview/[template]` renders standalone
production-style email HTML in a new tab. Reset uses the browser's latest recovery
receipt; unknown/missing/expired delivery shows unavailable. Four templates in
`public/emails/` are reusable engineering assets. Invitation/account previews are
synthetic only; account lifecycle and real email delivery are absent.
Authentication validation errors share visible rose alert styling.

## Expanded fixture coverage

50 Projects: 20 Live, 14 Pending, 9 Closed, 7 Canceled. Landing still exposes only
Live/Pending. 180 Subsamples: 19 Projects have one child, 9 have two, 8 have three,
7 have five and 7 have twelve. Original IDs/records remain. Added synthetic data
covers eight markets/languages, long names, no router, missing/empty quota tables,
zero metrics, 0.1–100% incidence, 0–180 minute LOI, large completes and remaining counts.
Development HMR appends newly seeded Subsamples to existing contact state without
discarding saved edits. Other seed edits still require a restart to reset mock state.
Email footers are “Ipsos Supplier Site” / “© 2026 Ipsos”.

## Projects controls / navigation alignment

Projects supports Previous/Next pagination, 10/20/50 items per page (default 10),
result ranges and boundary-disabled controls. Filter/view/page-size changes reset
to page one. Expand All/Collapse All apply to all matching Projects across pages;
controlled row state survives paging. Subsample metric labels are muted and values
use full foreground. Live/Pending uses a segmented selector with count badges and no View label.
All protected pages have white backgrounds; authentication remains light gray.
Mobile hamburger menu order is user/role, divider, navigation, Account Settings, divider, Sign Out.
Existing 50 Projects / 180 Subsamples already cover the requested fixture scope;
no further expansion was needed in this pass. All four email footers remain correct.

## Latest Projects refinement

Projects uses one calendar Date Range Picker with Apply/Cancel/Clear dates, arrow-key
navigation and normalized endpoints. Search/Language/range share a row when space
allows. Shared form controls are flat and 40px high. Projects use compact white bordered cards; bulk expansion uses row chevrons. Labels remain muted, values normal.
Activity shows line tabs beside its horizontal sidebar toggle, without a visible
Activity heading or widget-title dividers. Desktop account spacing is increased;
mobile Sign Out includes its icon.

## Latest focused refinement

Costs is the default first Activity tab; Reports is second. Desktop keeps its horizontal sidebar toggle without a vertical separator. Stacked layouts hide the toggle
and always expose content. Subsample rows use compact indented tree guides.
Date filtering opens presets first, with a calendar only for Custom Range. Previous
month presets cover complete calendar months; This Year ends today. Prototype Tools
retains its left red badge and gives newly available action identities a single
4-second text shimmer, disabled for reduced motion.

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
Shared Settings side navigation/mobile selector provides Personal Information (first/last name, email; Save/Cancel, validation,
unsaved-change protection and async feedback) and Security (masked Password, Change
Password via the existing recovery-email flow). PUT /api/account only edits the
session actor, rejects protected fields and duplicate emails, and refreshes header
identity. Profile storage is process-local. Email changes preserve password hashes
and invalidate old reset links. No additional security/session-management features.
See account-settings.md for API behavior, constraints and validation.

Costs responsive refinement: Pending/History use bounded wrapping desktop columns
and labeled two-column rows below 1024px. All fields, selection/approval and History
pagination remain available. Billing follows General in expanded details. ESLint,
TypeScript and diff checks passed; desktop browser inspection confirmed long-name
wrapping, visible amount columns and Billing placement. Mobile requires visual QA.

## Costs controls alignment

Costs view selector sits beside the title. Shared default Tabs now match the
Projects segmented selector: bordered muted container, white bordered active
segment, semibold selected label and no shadow; line-style tabs are unchanged.
Costs Expand All/Collapse All use row chevrons and apply to all filtered records in
the current view, including History pages, preserving expansion outside the filter.
On smaller screens checkbox and caret share a centered left rail, checkbox above
caret; all other row content sits in the right column. Desktop control spacing is compact. Admin-only approval behavior is unchanged.

Costs History shares the Projects DateRangePicker (presets/custom ranges) for
approval dates and ListPagination (range count, 10/20/50 sizes, Previous/Next).
History filters reset pagination. Mobile History mirrors Pending: separate status,
project/event and survey rows, one Country/Completes/CPI/Total Cost metrics row,
then Approver/Approval Date. Desktop History columns remain unchanged.

Supplier Settings now implements Organization, Users & Permissions (including preserved Contacts), Survey Configuration, Respondent Redirects, Server-to-Server and Security.
Desktop side navigation/mobile selector follows the reviewed references. Saves are
process-local and Admin-only. See [settings.md](settings.md) for implementation and limits.

## Shared Project/Subsample workspace

All Subsamples and individual Subsample pages reuse SubsampleWorkspaceShell and
ProjectContextPanel. Project name/count, status and business IDs remain visible in
the left column at 1024px+ (stacked on smaller screens). One dropdown contains View
All Subsamples first, then every project Subsample; the separate View All link is
removed. List mode shows Subsamples for [Project], a filtered Available Subsample(s) badge
and cards with structured metadata, with the whole card linking to its Overview. Individual mode retains the
existing heading, status, tabs and content. Dropdown navigation preserves the shared
unsaved-changes guard. Routes, supplier scoping and Project redirects are unchanged.

## Complete Project context

The shared ProjectContextPanel now includes Project Status, Project ID (external
surveyEventId), Job Book No°, Device Compatibility, Product Type, Research Type and
all category paths. Device chips use check/X for supported/unsupported and a minus
for unknown, with explicit accessible labels. Category paths wrap and use chevrons.
Both All Subsamples and individual views receive the same Project data/sidebar.
Project metadata fields are optional; missing values show Not Defined rather than
fabricated values. InnoTest metadata and Job Book 171213254 follow the reference,
including its two displayed category paths. Counts stay derived from child records:
InnoTest currently has two Subsamples; the reference’s four is not hardcoded.

## All Subsamples cards and filters

Only the right-hand All Subsamples content now uses one bordered, fully clickable
card per child; the Project sidebar/dropdown and breadcrumbs remain unchanged.
Header shows Subsamples for [Project] and a filtered Available Subsample(s) badge.
Name/ID search, supported status (Live/Pending/Canceled), dynamic language/router
choices and shared DateRangePicker combine with AND. Date filtering uses inclusive
Field End Date bounds; default is unbounded, matching Projects. Missing routers
have a Not assigned filter. Clear search and Clear all filters restore results.
Repository order is retained; local filters reset on navigation/reload and do not
alter fixtures or the sidebar total. Cards show router plus ID/status/language/
visitors/completes/incidence/LOI/start/end dates; details use a container-responsive
grid, matching badge colors and existing date format. Names and long IDs wrap.
A dynamically loaded card view uses card skeletons; a failed child-list read shows
an inline retry action with Project metadata retained. Unknown Project/auth failures
still use existing route boundaries. `tests/subsample-list-filters.test.ts` covers
combined criteria, name/ID search, stable order and inclusive field-end boundaries.

## Details reference alignment

Details follows `docs/references/Subsample Overview -_ Details.png`: substantial
Details and Configuration Summary columns with a vertical divider on desktop,
stacked sections on smaller screens, standalone metrics, paired field dates,
then Language, Router, Invoice Entity and Ipsos Contact. Summary rows are Custom
CPI, Custom Redirects, Custom Contacts, Personal Identifiable Info (PII), Facial
Coding and Marketplace Enabled. The summary has no card border or badges.
Contacts and Redirects reflect saved override modes; the other four indicators
are explicit read-only fixture flags (No/Off), not implemented configuration
editors. Missing fixture indicators display Not provided. Earlier requested
line tabs, header metadata order and removal of duplicate fields are retained.

## Overview navigation and Field Progress alignment

The shared Project/Subsample shell provides a desktop-only PanelLeft toggle that
collapses the project column horizontally. On stacked mobile/tablet layouts the
control is hidden and project context remains visible, including after resizing
from a collapsed desktop layout. The Overview header groups its title, toggle
and View All Subsamples action. The selector lists individual Subsamples first,
then a separator and View All Subsamples last. Contact draft protection remains
in place. Field Progress uses three compact label/value rows alongside the
Visitors, Incidence and LOI metrics, separated vertically on desktop and stacked
on smaller screens, following the Field Progress reference.

## Subsample Overview scenarios

Contextual Prototype Tools now offers Details, Field Progress, Costs, Contacts
and Configuration previews with descriptions and Restore Current Data. State
is temporary, resets on pathname change/reload and never writes fixtures or
saved data. Contact and Configuration previews are read-only; Configuration
editors remain unfinished. See [subsample-state-audit.md](subsample-state-audit.md)
for the reference comparison, exact scenarios and remaining gaps. Costs fixtures
contain only three direct pending records across 180 Subsamples; published,
discounted and rejected records are now available as local previews.

## Subsample standalone contact emails

Custom Subsample contacts reuse the Default Contacts picker: search/select known
contacts, add valid standalone emails by button or Enter, and remove chips.
Save submits known IDs plus new normalized emails. The supplier-scoped repository
validates the full selection atomically, reuses matching contacts or assigns
canonical IDs, and stores only the independent override IDs. Supplier defaults
remain unchanged. Cancel discards additions; invalid/duplicate emails and
unavailable contact IDs are rejected. Existing inheritance and permissions remain.

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
