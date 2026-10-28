# Design system — current implementation

Source verification: 2026-10-23. Visual references inform layouts but do not define
implemented features. Accessibility/enterprise principles are targets, not compliance claims.

## UI foundation

- Tailwind CSS v4 + PostCSS; local ShadCN-style Radix components in `src/components/ui`.
- Lucide icons; RHF + Zod for Login/Recovery/Contacts. Reports currently uses local
  form state plus Zod; do not document universal RHF adoption.
- Prototype guidance uses the shared Radix Popover-based floating tools component.
  Sonner 2.0.8 and its local primitive remain installed but are not mounted for guidance.
- Use existing primitives/compositions. Button currently supports default/sm sizes,
  not every upstream ShadCN example prop. Inspect installed/local APIs before copying.
- Shared `components/ui/password-input.tsx` preserves Input/RHF props and provides
  independent Eye/EyeOff visibility controls with keyboard access, aria-labels,
  aria-controls and aria-pressed for Login and both Reset fields.
- Native lists and local Table components, not TanStack Table. No new table library
  is needed merely to match an old documentation mandate.

## Branding

- Supplied asset: `public/logos/ipsos-logo.png` (62×56 native pixels).
- Shared `src/components/ipsos-logo.tsx` statically imports it via Next Image,
  preserves aspect ratio, uses alt `Ipsos`, and preloads it.
- Header: image height **32px** (`h-8`). Authentication: **56px** (`h-14`).
- Header home link has accessible name `Ipsos Supplier Portal home` and targets
  `/projects`. Adjacent Supplier Portal text remains; no letter-box branding placeholder.
- Authentication branding is one centered horizontal logo + **Supplier Site** row
  above the existing card. Shared auth layout covers Login, Forgot Password, email preview, Reset and success.
  Logo replacement did not introduce a new layout or promotional treatment.

## Layout / responsiveness

- Portal container `max-w-300` = 1200px. Outer padding 16px, 24px from `sm`.
- Header min-height 64px. Text-only primary links on desktop (1024px+). Below
  1024px, a labeled hamburger expands navigation below the header in normal flow;
  no off-canvas sidebar. Menu order is User Name / Role, separator, role-allowed
  navigation links, Account Settings, separator, Sign Out. User/sign-out controls are not duplicated
  in the mobile top row. Escape closes it and focuses its trigger.
- Authentication centers a `max-w-110` (440px) column in a full-height shell.
- Projects: explorer plus 340px Activity column at `xl` (1280px+), stacked below.
  Filters use Search, Language and one Date Range Picker. A 640px minimum
  explorer container puts all three on one row; narrower containers wrap.
  Live/Pending use a bordered segmented selector with integrated count badges and
  selected text/background hierarchy, without an enclosing tab strip.
  Activity uses `<TabsList variant="line">`. A PanelLeft sidebar trigger collapses
  its desktop column from 340px to a 48px rail, widening Projects; it expands back
  horizontally. No vertical accordion animation. Inactive/collapsed content is
  unavailable to keyboard/assistive technology; selected tab survives toggling.
  Smaller screens stack Projects above Activity, keep it expanded and hide the collapse control.
- Subsample: Project context and main content at `lg`; stacked below it. Section
  controls wrap. Configuration uses its existing subsection navigation.
- Costs filters: one column, two at `sm`, four at `lg`. Loading skeleton matches.
- Tables use horizontal overflow wrappers. Desktop-first, with 1440×900 primary,
  1280×800 secondary and 768×1024 tablet validation targets. Mobile is supported
  by reflow but context density remains an open issue.
- Tailwind v4 numeric utilities (`max-w-300`, fractional spacing) and
  `wrap-break-word` are valid. Do not enforce the old exclusive spacing list;
  current primitives use additional spacing and sizing values.

## Tokens and typography

Source: `src/app/globals.css`, light-only theme.

| Token              | Value   |
| ------------------ | ------- |
| background         | #f8fafc |
| foreground         | #172033 |
| card               | #ffffff |
| card-foreground    | #172033 |
| primary / ring     | #174ea6 |
| primary-foreground | #ffffff |
| muted              | #eef2f7 |
| muted-foreground   | #536176 |
| border             | #d8dee8 |

- Base font Arial/Helvetica/sans-serif, 14px, line-height 1.5.
- Typical page headings `text-2xl font-semibold`; section headings text-lg/sm;
  supporting labels/text text-sm/xs. Some section headings are uppercase/tracked;
  actual screens are not uniformly sentence case.
- Global focus-visible outline is 3px ring color with 2px offset; controls add
  local focus styles. No dark-mode implementation.
- Popover, accent, secondary, input and destructive tokens are now defined globally.
  Popover/Select surfaces are opaque white with dark text; option hover/focus/checked
  states are explicit. Select uses a collision-aware anchored popper at z-60; Popover
  uses z-50, viewport-constrained width/height, scrolling and explicit input borders.
  Dark variants require an explicit `.dark` ancestor; OS dark preferences do not
  override the application’s light palette.
  Contacts combobox uses the same Popover/Input/Checkbox primitives. No separate
  Command or Dropdown Menu implementation exists. Formal contrast certification is absent.

## Status and interaction conventions

- Status uses text plus color, not color alone. Badges are frequently outline;
  reports also use labeled icons. Reduced-motion handling exists on executing-report spinners.
- Project: Live/Pending/Closed/Canceled. Subsample: Live/Pending/Canceled.
  Report: Queued/Executing/Finished/Error. Cost: Pending Approval/Approved/Rejected.
- Labels/color maps/formatters are currently repeated per feature, not a universal
  central status component. Preserve status semantics when sharing code.
- Internal navigation uses Next Link; download is a native anchor with download
  attribute; email contacts use mailto links. Link hover underline is common;
  icons accompany some internal actions, so historical no-icon rules are not absolute.
- Loading: skeleton route fallbacks. Retry errors use Next error boundary `retry`.
  No-data and no-match states exist but some filter wording remains inaccurate.
- Costs uses AlertDialog for bulk decision confirmation; errors render inside it.
- Contacts forms show inline dirty/saving/error/success states. Report creation
  confirms the returned ID in Queue; cost success confirms count and decision.
- Unsaved navigation warnings use native confirms, not a custom modal redesign.

## Prototype messaging

`PrototypeEnvironment` is mounted once in the root layout and includes page-scoped Tools. `FloatingPrototypeTools` is the
reusable presentation component with optional action-count badge and availabilityKey. The panel displays page-specific actions only.

- Muted Wrench trigger labeled Prototype Tools, fixed bottom-right. Popover opens upward, aligned right,
  with explicit Close, Escape and outside-click dismissal; trigger reopens it.
- Login defaults collapsed; Forgot Password Confirmation defaults expanded without
  focus theft. Other routes default collapsed. Route changes reset contextual state.
- No prototype toasts, expiry timers or sessionStorage deduplication.
- Confirmation's Open Reset Password Email action lives in Tools and opens a standalone email in a new tab.
  Its card contains neutral messaging and the two production-style return actions.
- Authentication support message sits outside/below cards in the shared layout.
- Report downloads do not open informational Tools content.
  Operational feedback and approved email copy remain inline and unchanged.
- Message content and behavior: [prototype-messaging.md](prototype-messaging.md).

## Accessibility baseline and remaining work

Existing skip link, labeled inputs, RHF error associations in auth/contact editors,
status/alert live regions and visible focus are baseline implementation. Target is
WCAG 2.2 AA, not a passed audit. Known gaps include report validation association,
repeated cost control names, route-tab relationships and Settings focus restoration;
see [known-issues.md](known-issues.md). Do not turn these into a false compliance claim.

## Email assets / validation

Four branded responsive HTML emails live in `public/emails/`: reset-password,
user-invitation, password-changed and account-created. Fluid presentation tables,
inline core styles, mobile rules, preheader, Outlook VML buttons and fallback links
support engineering reuse. `/email-preview/[template]` renders the same files outside
the portal shell in a new tab. No Mock Inbox workflow remains. See
`public/emails/README.md` for variables and mail-client validation boundaries.
Authentication uses shared `FieldError` rose text/alert styling, not undefined
`text-destructive`, including the invalid-email message.

Tools actions follow workflow context; see [prototype-messaging.md](prototype-messaging.md).
Badge precedes the label, red-700 with white numerals; count is described accessibly
and announced politely. A single 4-second text shimmer animates badge arrival/action changes,
never panel reopening, and is omitted under prefers-reduced-motion.

Native date Inputs share a far-right CalendarDays affordance. Native picker behavior
and keyboard date editing remain; the WebKit native hit target occupies the same
right-hand area without a duplicate icon. This covers Reports and Costs; Projects uses the shared calendar range picker.
All four email footers use “Ipsos Supplier Site” and “© 2026 Ipsos” on separate lines.

## Projects list controls and route surfaces

PortalShell scopes the background token to white for every authenticated page.
Authentication keeps the light gray #f8fafc surface. Summary labels use muted text;
values explicitly use full foreground color (not reduced opacity).
Projects pagination defaults to 10 rows, with 10/20/50 page sizes. Range and current
page are announced; Previous/Next disable at boundaries. Filters, status and page size
reset page to one. Expand All/Collapse All act on all filtered Projects across pages;
individual row expansion is controlled by the explorer and survives paging/filtering.
Dropdown option text wraps for long scope names; Popover surfaces expose focus rings
and Contacts choice rows highlight keyboard focus as well as hover.

Global default border color and fallback focus outline are in Tailwind's base layer,
allowing component
transparent/active/focus border utilities to override it. This prevents unwanted
boxes around line-style tabs, avoids doubled focus outlines/rings, and restores
explicit dropdown/badge border styling.

## Shared controls and compact Projects layout

`components/ui/form-control.ts` owns the flat 40px treatment for text/search Input,
Select, Contacts combobox and DateRangePicker triggers. Controls use the same border,
white background and focus treatment without elevation; overlay shadows remain.
Projects DateRangePicker uses a single right-icon trigger and a popover calendar.
Arrow keys move by day/week; Home/End move within a week. Start/end selection supports
reversed endpoints; Apply commits a complete range, Cancel discards the draft and
Clear dates removes the filter. Labels and full selected ranges are accessible.
Projects use compact white cards with light borders, small radii and spacing. Expand All/Collapse All use the same
ChevronRight/ChevronDown as row toggles. Activity's line tabs and PanelLeft control
share one header row; no visible Activity heading. Widget titles sit close to content
without a following divider. Desktop name/role opens the Account Settings / Sign Out dropdown; mobile Sign Out retains LogOut.

## Focused Projects hierarchy and Activity behavior

Activity tabs are Costs (default), Reports. Desktop (1280px+) shows tabs beside the PanelLeft toggle without a vertical separator. Stacked layouts have no toggle or
separator and always render the panel expanded. Returning to desktop restores its
collapse choice. Subsample rows use a left border and short branches, compact
indentation and a 2px name-to-metrics gap; they remain semantic lists, not ARIA trees.
DateRangePicker shows presets first: Last Month, Last 3 Months, Last 6 Months, Last
12 Months, This Year, Custom Range. Previous-month presets use complete previous
calendar months; This Year uses January 1 through today. Custom Range alone exposes
the calendar, preserving keyboard selection and Apply/Cancel/Clear behavior.
The left red Prototype Tools badge remains high contrast; badge numerals only
use one 4-second gradient text-highlight sweep on action identity arrival/change.
This follows the ShadCN Attachment shimmer-once approach, never loops and respects
prefers-reduced-motion. Reopening the popover does not restart it.

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

## Full-width Report row actions

Reports History/Queue reuse the Projects widget status actions: finished names/icons
download the sample, queued/executing names/icons select Queue locally, and error
icons open dismissible details on click/tap or keyboard (hover is optional). Report
icons and the outlined Download report button provide 44px touch targets. Scope,
identifier, timestamp and status remain visible in the full-width list.

Reports renders Report Activity directly on the page as a labeled section, without
a surrounding card, outer border/shadow, header divider or inset card padding.
Filters, History/Queue tabs and report row separators retain their behavior.

## Costs responsive layout

Costs Pending and History use fixed-layout desktop tables (1024px+) with wrapping
project/survey names, keeping amounts and other columns within the page width.
Below 1024px, rows become labeled two-column summaries; selection, bulk selection,
expansion, amounts and History pagination remain available. Expand controls have
44px touch targets on smaller screens. Expanded details place General then Billing
in the left column, Adjustments then Approval on the right; mobile stacks them.

## Costs controls alignment

Costs view selector sits beside the title. Shared default Tabs now match the
Projects segmented selector: bordered muted container, white bordered active
segment, semibold selected label and no shadow; line-style tabs are unchanged.
Costs Expand All/Collapse All use row chevrons and apply to all filtered records in
the current view, including History pages, preserving expansion outside the filter.
On smaller screens row controls share a 44px left rail: checkbox above caret,
centered on the same axis, with all other row content in the right column. Desktop
checkbox/caret columns use compact widths and reduced cell padding. Admin-only approval behavior is unchanged.

Reports History/Queue uses the same segmented selector as Costs beside the page
title, with an integrated Queue count badge. Filters and row actions are unchanged.

Reports header aligns Create Report with the title/segmented selector at 768px+;
below 768px the action occupies a second row.

View selector count badges share ViewCountBadge: active views use primary blue
with white text; inactive views use white with foreground text. Projects Live/
Pending, Costs Pending Approval and Reports Queue update badge color on selection.
Status badges and Prototype Tools notifications retain their semantic colors.

Costs Pending mobile rows put status, project/event name and survey/subsample on
separate full-width content rows. Country, Completes, CPI and Total Cost share one
four-column metrics row. The checkbox/caret remain in the left rail. Project names
truncate with full text in a tap/click/keyboard Popover (and native hover title).
History retains paired metadata columns.
Desktop table wrapping and approval behavior are unchanged.

Costs filters below 1024px use a full-width Search row followed by two equal filter
columns (Country/Status for Pending). Mobile pending rows use compact cell padding
and name spacing; checkbox/caret targets remain 44px in the independent left rail.

Costs History shares the Projects DateRangePicker (presets/custom ranges) for
approval dates and ListPagination (range count, 10/20/50 sizes, Previous/Next).
History filters reset pagination. Mobile History mirrors Pending: separate status,
project/event and survey rows, one Country/Completes/CPI/Total Cost metrics row,
then Approver/Approval Date. Desktop History columns remain unchanged.

Costs shows Clear Filters after Collapse All at the right end of the toolbar in both views,
using the Projects ghost button and X icon. It clears
search, country/status and approval dates plus bulk selection, retaining the active
view and row expansion. It is visible only while a filter is active.

## Supplier Settings layout

Six icon navigation items follow the Settings reference screens, with a 260px
left column/divider at 1024px+ and a shared section Select below. Content uses title/
breadcrumbs, reference field groups and existing flat controls. Default Contacts
sits below User Management in Users & Permissions with its original editor/inheritance behavior. Users
uses a responsive shared table, dropdown actions and Radix invite/edit dialogs; forms
reuse RHF/Zod, FieldError, async states and draft protection. Blue theme/two domain
roles remain consistent with the portal. See settings.md for reference deviations.

Default Contacts uses one shared contact-picker Popover: searchable portal-user
choices, valid email creation, checkbox multi-selection and removable chips. Keyboard
users can Tab through choices, Space to select, Enter to add an email, and Escape to
close. The same picker renders Subsample custom choices without email creation.

Account Settings shares the Supplier Settings shell and section navigation: 260px
left column/right divider at 1024px+, shared mobile Select below, User/Shield icons,
matching selected states and section title/breadcrumbs. Both use max-w-3xl forms.
Account has no top tabs; its existing discard confirmation guards section changes.

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

## Subsample Overview hierarchy

The workspace header shows the Subsample name at the same 20px semibold scale
as the Project name, followed by Status and ID metadata. Details omits duplicate
name, status and ID fields. The five workspace sections use wrapping line-style
tabs; route navigation and unsaved-change protection remain unchanged.

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

## Project panel collapse correction

Keep the Project context grid item mounted in its zero-width desktop track when
collapsed; hiding it with display:none caused auto-placement to put the Overview
in that zero-width track. The Overview explicitly occupies column 2, whose
minmax(0,1fr) track takes all available width. The hidden context is clipped and
invisible (not focusable) at desktop widths, with stable internal width during
horizontal animation. Column gap and content padding also collapse. Below the
1024px side-by-side breakpoint, context returns to normal stacked flow and the
toggle is hidden, regardless of desktop collapse state.

## Shared horizontal panel pattern

`components/ui/horizontal-panels.tsx` owns collapse state, zero-width grid tracks,
200ms horizontal transitions with reduced-motion support, and accessible triggers.
Icons follow panel position: left panels use PanelLeftClose / PanelLeftOpen,
right panels use PanelRightClose / PanelRightOpen. Close points toward the panel
edge; Open points back toward the content. Triggers
live in the primary content header, never the collapsible panel. Projects places
its Activity trigger at the far right of the Projects header and removes the
entire Activity width/gap on collapse. The Subsample shell uses the same pattern
for Project context. Breakpoints match side-by-side layouts (Projects xl,
Subsamples lg); stacked layouts always show panel content and hide the trigger.
Mounted content retains Activity tab state through collapse/expand.

The Subsample count uses the primary blue badge. View All Subsamples uses the
shared extra-small button size (24px height, 12px text).

All Subsamples places its Project panel trigger immediately before the list title
in the same header row; individual Overview screens retain their own header row.

Subsample scenario controls use contextual Prototype Tools buttons with concise
visible-state descriptions and Restore Current Data. Previews reuse tab layouts;
Contacts and Configuration previews expose no save action.

Subsample Contacts uses the standard uppercase muted section heading. The mode
indicator reads “On · Inherited from Default Contacts”; Default Contacts links to
the management section for Administrators only. No duplicate inheritance badge
or introductory explanation is shown. Subsample Costs omits the redundant
approval-management footer message.

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

## Responsive Subsample section navigation

Below lg (1024px), the five workspace tabs are replaced with a labeled Section
Select, matching Settings/Account responsive navigation. It reflects the active
route and uses the same guarded navigation as desktop tabs. At lg and above,
existing line tabs remain on one row. Hidden navigation is not keyboard-focusable.
