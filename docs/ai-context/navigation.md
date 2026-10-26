# Navigation — implemented routes

Source verification: 2026-10-22. Route groups `(auth)` and `(portal)` are filesystem
organization, not URL segments. Dynamic page/handler params use Promise types.

All paths below are relative to the `/supplier` deployment prefix. The deployment
uses trailing slashes; client navigation compares paths without the final slash
to preserve active Settings, workspace tabs, and prototype controls.

## Primary structure

- Projects is the operational landing page after login and the destination of `/`.
- Header: Projects, Reports, Costs, Docs; Administrators additionally see Settings.
- Dashboard is removed. `/dashboard` has no page or redirect.
- Portal layout calls `requireUser()`. Settings layout/page calls
  `requireAdministrator()`; non-admin access redirects to `/projects`.
- Login redirects an already signed-in user to Projects. Other recovery pages
  currently remain reachable while signed in (not guarded by the auth layout).
- Global Prototype Tools opens an upward floating Popover, not a route. Login Tools starts
  collapsed; recovery confirmation starts expanded with Open Reset Password Email inside Tools.

## Public pages

| Route                           | Implemented behavior                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `/`                             | Redirect to `/projects`, then portal session guard applies                              |
| `/login`                        | Email/password/remember-me form, Forgot Password link                                   |
| `/forgot-password`              | Email recovery request                                                                  |
| `/forgot-password/confirmation` | Neutral response, two return links; email preview action in floating tools                                                    |
| `/email-preview/[template]` | New-tab standalone HTML: reset-password, user-invitation, password-changed, account-created |
| `/reset-password?token=…`       | Valid token: reset form; missing/used/malformed/unknown: invalid; expired: expiry state |
| `/reset-password/success`       | Password-updated message and Back to Sign In                                            |

## Protected pages

Use `P = /projects/[projectId]` and `S = P/subsamples/[subsampleId]` below.

| Route              | Access     | Current content / destination                                            |
| ------------------ | ---------- | ------------------------------------------------------------------------ |
| `/projects`        | Both roles | Explorer plus switchable Costs/Reports Activity panel              |
| `/account` | Both roles | Personal Information and Security; self account settings |
| `P`                | Both roles | Redirect to `P/subsamples`                                               |
| `P/subsamples`     | Both roles | Cards, filtered count, search/status/language/router/date filters; shared Project sidebar |
| `S`                | Both roles | Redirect to `S/details`                                                  |
| `S/details`        | Both roles | Subsample metrics, attributes, saved custom-setting summary              |
| `S/field-progress` | Both roles | Metrics and quota table/empty state                                      |
| `S/costs`          | Both roles | Directly scoped informational cost summaries                             |
| `S/contacts`       | Both roles | Saved inherited/custom contacts; Admin link to Default Contacts     |
| `S/configuration`  | Both roles | Placeholder subsection content and Return to Subsample Details           |
| `/reports`         | Both roles | History/Queue, creation links, activity filters                          |
| `/reports/create`  | Both roles | Creation form for one of three report types                              |
| `/costs`           | Both roles | Pending/History; decisions only for Admin                                |
| `/settings`        | Admin      | Organization company name and time zone                                      |
| `/docs`            | Both roles | Placeholder: no content yet; Return to Projects                          |

### Current query parameters

- `/reports?view=queue`: initial Queue selection; otherwise History. `created=<id>`
  shows creation feedback only if the supplier's loaded reports contain that ID.
  Subsequent view/filter changes are local component state, not URL persistence.
- `/reports/create?type=respondent_info|survey_duration|mini_router_quota`:
  initial report type; invalid/missing defaults to Respondent Info.
- `S/configuration?section=entry-links|redirects|server-to-server|security`:
  section navigation only. Invalid/missing section resolves to Entry Links.
- `/reset-password?token=<64-hex-token>`: reset capability. Never log or paste real tokens.
- Costs views/filters, Project view/filters and expanded rows are local state.

## Operational navigation behavior

- Projects groups expand to show Subsamples; selecting a Subsample enters Details.
  Landing exposes Live and Pending only, despite Closed/Canceled domain records.
- Shared workspace shell keeps Project context and business IDs for both All
  Subsamples and individual views. One dropdown starts with View All Subsamples,
  followed by every sibling. Selecting a sibling opens Details; selecting View All
  opens the list. Individual views retain breadcrumbs and section tabs.
- Breadcrumb Home and Projects both target `/projects`. Project breadcrumb targets
  `P`, which redirects to All Subsamples.
- Subsample Contacts/Settings/report drafts warn on supported leave paths. Guarded
  programmatic navigation and sign-out use the existing custom event; no general
  router-level blocker is installed.
- Recent Reports Create New Report currently links to `/reports`, not the form.
- Subsample Configuration editors remain placeholders. Supplier Settings implements
  the reference sections at `/settings/[section]`; see settings.md.

## API routes

| Route                                                         | Method | Access and effect                                                                                      |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `/api/auth/mock-session`                                      | POST   | Public mock login; sets session cookie or generic 401                                                  |
| `/api/auth/mock-session`                                      | DELETE | Clears current cookie; no separate role restriction                                                    |
| `/api/auth/password-recovery`                                 | POST   | Public validated email; neutral confirmation and email preview receipt cookie                                  |
| `/api/auth/reset-password`                                    | POST   | Public token capability; validates passwords/token, updates mock credential and clears current session |
| `/api/reports`                                                | POST   | Authenticated supplier; validates and creates queued report                                            |
| `/api/costs/decisions`                                        | POST   | Admin; bulk approve/reject owned pending records                                                       |
| `/api/settings/contacts`                                      | PUT    | Admin; validated Organization Contact defaults                                                         |
| `/api/projects/[projectId]/subsamples/[subsampleId]/contacts` | PUT    | Authenticated supplier member; validates ownership, canonical parent and contact selections            |

These are mutation handlers, not a complete REST read API. Server pages read services.
`/mock-reports/RPT-2026-1045.csv` is a public synthetic static asset, not an
authenticated export endpoint. Unknown pages use `src/app/not-found.tsx`.

## Loading / failure coverage

- Skeletons and error boundaries exist for Projects, Project descendants, Reports,
  Costs, Settings, Forgot Password and Reset Password; Contacts has local boundaries.
- Other Subsample sections inherit Project-level loading/error handling, not one
  separate boundary per section. Missing/foreign workspace records use not-found.
- Deferred routes have explicit return actions. See [known-issues.md](known-issues.md)
  for remaining flow, validation and responsive problems.

Email previews are public receipt/sample routes outside the authentication layout,
not protected portal pages. `/forgot-password/inbox` has been removed. Tools links
open previews in new tabs; only reset previews contain an actual mock capability.
Receipt cookie is `ipsos_prototype_email` scoped to `/email-preview`.

Header primary links are text-only. Below 1024px, hamburger navigation expands
below the header; no off-canvas navigation. Activity offers Costs/Reports tabs and
horizontal sidebar collapse/expand; selection persists through collapse. Desktop two-column layout
starts at 1280px; smaller viewports stack the explorer and Activity.

Mobile expanded menu includes User Name / Role, divider, primary links (Settings
only for Admin), Account Settings, divider, Sign Out. Projects pagination and expansion are local
state: page size 10/20/50, filters reset page one, expansion survives page changes.

Activity tab order is Costs (default), Reports. Its sidebar toggle is desktop-only (1280px+); stacked layouts always show the panel content.

Prototype Tools appears only where relevant actions exist. Reports/Costs root pages
offer temporary empty previews with Restore actions. State resets on pathname change
or reload. Projects has Activity-specific empty-state toggles; Settings/Docs have no Tools trigger. Confirmation exposes only
Open Reset Password Email. See prototype-messaging.md for the action matrix.

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

`PUT /api/account` saves only the session actor’s first/last name and email, with
validation, duplicate-email rejection and no role/supplier/identity changes.

## Supplier Settings routes

`/settings` is Organization profile; Contacts sits below User Management at `/settings/users`.
`/settings/organization` redirects to `/settings`.
Admin-only `/settings/users`, `/settings/survey-configuration`, `/settings/redirects`,
`/settings/server-to-server`, `/settings/security` share desktop side navigation and
a mobile selector. Unknown sections return 404. PUT `/api/settings/preferences`
saves one section; POST `/api/settings/users` manages supplier users. Both require an
active same-supplier Administrator. Existing Contacts API remains unchanged.
