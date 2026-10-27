# Feature inventory

Source verification: 2026-10-22. Allowed statuses: Complete, Partial, Placeholder,
Not Started. Complete means the stated prototype slice works; it never means a
production integration exists. Parent statuses include their missing subareas.

| Area / slice                                   | Status      | Current boundary                                                             |
| ---------------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| Shared shell and branding                      | Complete    | Ipsos logo, primary nav, skip link, authenticated layout                     |
| Prototype guidance                             | Complete    | Action-only Tools, contextual email/sample links, temporary Reports/Costs empty previews    |
| Authentication (mock scope)                    | Complete    | Login/logout, signed cookies, roles, request → email preview → reset → success       |
| Login and remember-me                          | Complete    | 8-hour/30-day signed session; reset-aware mock password check                |
| Forgot Password / confirmation                 | Complete    | Same request response for known/unknown email                                |
| Email previews and link-state controls             | Complete    | Latest browser request, no SMTP, non-destructive test links                  |
| Reset / invalid / expired / success            | Complete    | Server-checked 60-minute single-use links and matching passwords             |
| Production identity/email/MFA                  | Not Started | No real identity provider, mail transport or MFA                             |
| Projects area                                  | Partial     | Functional landing/list; limited status access and comparison tools          |
| Projects landing                               | Complete    | Live/Pending, filters, 10/20/50 pagination, bulk expansion, horizontal Activity      |
| Project context entry                          | Complete    | Redirects to existing All Subsamples list; no standalone overview            |
| All Subsamples                                 | Complete    | Shared Project sidebar, clickable cards and combined search/status/language/router/date filters              |
| Subsample Workspace                            | Partial     | Shared context and populated sections; Configuration is read-only     |
| Details                                        | Complete    | Attributes, metrics, configuration-mode indicators from saved state          |
| Field Progress                                 | Complete    | Fixture metrics, quota table and no-quota state                              |
| Subsample Costs                                | Complete    | Directly scoped information only, no approvals or Project roll-up            |
| Subsample Contacts                             | Complete    | Persisted inherit/custom mode, selections, save/cancel and feedback          |
| Configuration navigation                       | Partial     | Query-selected subsections and return path only                              |
| Entry Links editor                             | Partial | Populated read-only configuration UI                                                    |
| Subsample Redirects editor                     | Partial | Populated read-only configuration UI                                                    |
| Subsample Server-to-Server editor              | Partial | Populated read-only configuration UI                                                    |
| Subsample Security editor                      | Partial | Reference no-rules UI and scenario controls                                                    |
| Reports area                                   | Partial     | Creation/activity work; execution and real outputs absent                    |
| Three report creation flows                    | Complete    | Existing options, scope validation, queued save, draft warning, confirmation |
| History / Queue                                | Partial     | Search/status/date filters; static execution state; no pagination/retry      |
| Finished fixture download                      | Complete    | Synthetic sample CSV, not a real report result                               |
| Report execution / generated exports           | Not Started | No worker, progression or real data output                                   |
| Costs (mock approval slice)                    | Complete    | View/filter/details, bulk decisions, history and feedback                    |
| Pending cost decisions                         | Complete    | Administrator-only, all-record validation before mutation                    |
| Cost History                                   | Complete    | Approved/rejected records, approver/date, details, shared 10/20/50 pagination and approval date-range picker        |
| Cost invoicing / allocations                   | Not Started | No invoice workflow or Project-to-Subsample allocation                       |
| Account Settings (/account) | Complete | Both roles: self profile Save/Cancel, unsaved protection, Security reset-email action; process-local storage |
| Settings area                                  | Partial     | Six reference sections; process-local saves/actions; see settings.md                                       |
| Default Contacts defaults                 | Complete    | Portal users and standalone emails; chips; Administrator-only save                  |
| Organization profile                           | Not Started | No page/editor/API                                                           |
| Users & Permissions management                 | Partial     | Invite/edit/status/reset UI and API; no invitation acceptance or real delivery                                   |
| Supplier survey/redirect/S2S/security settings | Partial     | Complete editable UI/mock saves; no execution or non-contact inheritance                                                    |
| Docs                                           | Placeholder | Unavailable content and Return to Projects                                   |
| Durable persistence / external APIs            | Not Started | JSON seeds plus process-local mock mutations                                 |
| Regression tests                               | Partial     | Contacts/recovery/emails, account profiles, Project filters and report IDs; browser checks manual            |

Dashboard is removed, not an unfinished feature. Screenshot-only roles/reports are
not supported; do not treat them as inventory requirements.

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


Account Settings is separate from organization Settings. Desktop identity dropdown
and mobile hamburger link to /account. See account-settings.md for current behavior
and production integration boundaries.

## Reports landing page

Reports provides one Create Report action in the page header above Report Activity.
The three report-type shortcut cards have been removed; all three types remain
available in the existing creation form. History/Queue and filters are unchanged.

## Full-width Report row actions

Reports History/Queue reuse the Projects widget status actions: finished names/icons
download the sample, queued/executing names/icons select Queue locally, and error
icons open dismissible details on click/tap or keyboard (hover is optional). Report
icons and the outlined Download report button provide 44px touch targets. Scope,
identifier, timestamp and status remain visible in the full-width list.

Subsample Overview supports contextual, non-persistent state previews in all five
tabs. Configuration defaults and previews are read-only; saving is not implemented. See
[subsample-state-audit.md](subsample-state-audit.md).
