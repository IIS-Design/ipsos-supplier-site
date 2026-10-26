# Supplier Settings

Implemented against all Supplier Settings references in `docs/references/`:
Organization, Users & Permissions, Invite User Modal, Edit User Modal, User Dropdown-1,
Survey Configuration, Respondent Redirects, Server-to-Server, Security. Account
Settings references and Subsample Configuration references were also reviewed for
consistency; those workflows remain separate.

## Navigation and sections

Administrator-only layout uses a 260px icon navigation column with a right divider
and content area on desktop (1024px+). Below that breakpoint a shared Select chooses
the section. Section headings, breadcrumbs, field ordering and grouping follow the
references. Existing primary navigation, blue theme and 40px controls are retained.

- `/settings`: Organization company name and time zone only.
- `/settings/users`: User Management search/status filter, responsive table,
  invite/edit dialogs, reset-password and deactivate/activate row actions, followed
  by Organization Contacts with unchanged Supplier → Subsample inheritance.
- `/settings/survey-configuration`: five required-field choices.
- `/settings/redirects`: four Survey Outcomes and four Other Outcomes URLs.
- `/settings/server-to-server`: seven endpoints, four routing choices, custom
  minutes/attempts and and/or combination; defaults are 15 minutes/4 attempts.
- `/settings/security`: source key, masked/revealable secret, confirmed regeneration
  of a staged synthetic key. Save commits; Cancel restores the saved values.
- `/settings/organization` redirects to `/settings`; unknown sections return 404.

Organization Contacts appears only below User Management at `/settings/users`.
Subsample contact-management links target `/settings/users#organization-contacts-heading`.
There is no separate Contacts navigation entry; contact saves revalidate the Users page. Account Settings stays at `/account`.
Roles remain Administrator (`admin`) and User (`user`), replacing screenshot-only
Project Manager/Finance roles. A small curated IANA time-zone list supports the demo.
Security copy describes credentials rather than repeating the reference’s routing
sentence. Save/Cancel/validation and async feedback reuse existing form conventions.

## Architecture and validation

`settings-model.ts` defines strict Zod schemas and defaults. Settings pages read
services → repository contracts → mock adapter. `SettingsRepository` uses
`__ipsosSupplierPreferences`, keyed by supplier. Organization name updates the shared
supplier contact-state record. User management extends the existing UserRepository
and `__ipsosAccountUsers`; it does not create a separate user directory. Mutations
validate the active same-supplier Administrator in both the API and adapter.

- `PUT /api/settings/preferences`: section + typed values; updates only the chosen
  section, clones state, revalidates Settings and Project layouts.
- `POST /api/settings/users`: discriminated invite/edit/activate/deactivate/reset-password
  action. IDs and supplier ownership cannot be supplied through editable profile fields.
- Existing `PUT /api/settings/contacts` and contact contracts are unchanged.

Names/emails are normalized with the shared account schema. Emails are unique across
the directory; unsupported roles/extra keys are rejected. URLs accept blank or HTTP(S)
only. Routing limits are bounded integers (1–1440 minutes, 1–100 attempts).
Dirty forms reuse `useUnsavedChanges`; mobile programmatic navigation dispatches the
same guard event as sign-out. Dialog close warns before discarding edits.

Self-deactivation/self-demotion are blocked. Existing users without a status are
Active; new invitations are Invited. Invited/inactive users cannot sign in or resolve
an existing session and receive no new reset capability. Admin reset actions reuse
the existing recovery service and receipt-scoped HTML preview. Editing one’s own
profile refreshes the header identity. Inactive users can be reactivated.

## Prototype boundaries

Values and users persist only in the current process; no JSON files are written.
Invitation confirmation/preview is simulated with the existing sample HTML template;
no SMTP or invitation acceptance/account activation flow is added. Invited records
remain Invited. Reset Password previews use actual mock recovery receipts.
Integration source/secret keys are synthetic; there is no external credential rotation,
endpoint execution or real authentication integration. Required survey fields, routing
and URL defaults are editable supplier settings, not an enforcement engine. Subsample
Configuration remains a placeholder; only Contacts currently has operational
Supplier → Subsample inheritance. No Project inheritance layer is introduced.

Tests in `tests/settings.test.ts` cover schema boundaries, section isolation, cloned
reads, cross-supplier/admin authorization, duplicates, statuses and self-lockout.
All 30 existing/new TAP results, TypeScript, ESLint and webpack build passed. Fresh
production browser checks verified Organization save, invite validation, invalid URL
feedback, routing controls and the five checkbox options. Development browser checks
at 390px verified mobile section selection and no horizontal overflow. A running dev
process can retain old repository modules after interface expansion; restart it if
Settings save reports a missing repository method. A fresh production server was
used to verify saves without resetting the existing demo’s process-local data.
