# Domain model — implemented contracts

Verified against `src/types`, repository contracts and fixtures on 2026-10-22.
Fields below are current data contracts, not claims that all corresponding editors exist.

## IDs, ownership and scope

- `ids.ts` defines branded string IDs for Supplier, User, Project, Subsample, Report,
  Cost, SurveyEventId and JobBookNumber. Internal IDs and external business numbers
  are not interchangeable.
- `supplierId` on operational entities is the supplier ownership boundary.
- `Subsample.projectId` is canonical Project membership; derive children. Projects
  do not keep an independent child-ID list.
- `scopes.ts`: ReportScope and CostScope are Project-or-Subsample discriminated
  unions: `{ scopeType: "project", projectId }` OR
  `{ scopeType: "subsample", subsampleId }`, never both targets.

## Supplier and User

- Supplier: id, name, settings. Current Settings UI only edits contacts. Reserved
  redirects/serverToServer/security payloads do not imply working configuration.
- User: id, supplierId, firstName, lastName, email, role (`admin` or `user`).
  No password/account-lifecycle fields in this type; mock reset credentials live
  separately in the recovery store. No user management/invitation repository writes.
- Admin can access Settings, save contact defaults and decide costs. Both roles
  read operational pages, request reports and save owned Subsample contact overrides.

## Project

`project.ts`: id, supplierId, surveyEventId, name, status, jobBookNumber.
Statuses: live, pending, closed, canceled.

Project is a grouping/context entity, not the primary operational workspace.
Project entry redirects to All Subsamples. Landing filters only Live/Pending.
No Project configuration layer or cost aggregation/allocation is implemented.

## Subsample

`subsample.ts`: id, supplierId, projectId, name, status, language, country, router
(nullable), fieldStartDate, fieldEndDate, optional invoiceEntity/ipsosContact;
incidence, visitors, loi, achievedCompletes, exclusiveRemaining, sharedRemaining;
optional quotaBreakdown and settingsOverrides.

- Statuses: live, pending, canceled.
- Incidence displays as percentage; LOI displays in minutes. Counts display as
  supplied; UI does not derive metrics from respondent data or keep them live.
- Quota rows: quotaGroup, achieved, exclusiveRemaining, sharedRemaining. Missing
  quotaBreakdown renders an empty state, not an invented zero breakdown.
- Sections: Details, Field Progress, Costs, Contacts, Configuration. Last section
  has navigable placeholders only; other sections render actual fixture-backed data.

## Contact inheritance

`SupplierContact = { id, name, email }`.
`SupplierContacts = Record<SupplierContactRole, SupplierContact[]>`.
Roles: projectManager, salesContact, financeContact, helpDesk.

Current hierarchy: **Supplier defaults → Subsample**. No Project intermediary.

- `SettingOverride<T> = { mode: "inherit" } | { mode: "override", value: T }`.
- `SubsampleContactOverrides` is partial role → contact-ID array, not contact objects.
- Missing or inherit Contacts resolves latest saved Supplier contacts when read.
- Override resolves role-scoped known IDs from supplier contact options. Missing/
  empty role means no custom contacts, not fallback.
- Editing a default creates/reuses immutable identities; old options are retained
  so existing custom selections do not change or become unresolvable.
- Settings save is Admin-only; Subsample save accepts either role for its supplier
  and checks canonical Project relationship. Saving inherit removes custom values.
- Redirects/serverToServer/security override types exist, but their editors and
  inheritance save/resolution workflows are not implemented.

See [contact-inheritance.md](contact-inheritance.md) for exact interactions and tests.

## Reports

`report.ts`: id, supplierId, scope, type, status, requestedByUserId, createdAt;
optional startedAt, finishedAt, parameters, downloadUrl, errorMessage.

- Types: respondent_info, survey_duration, mini_router_quota.
- Statuses: queued, executing, finished, error.
- Creation generates a RPT-YYYY-NNNN identifier, queued status and current timestamp. No executor/status
  update method exists. Activity statuses/times otherwise come from fixtures.
- Parameters are an open record assembled by the validated creation endpoint.
  Existing options include date range and report-specific respondent/link/output flags.
- The finished fixture links to a public synthetic CSV; it is not generated from
  current selections or live respondent data.

## Costs

`cost.ts`: id, supplierId, scope, completes, cpi, totalCost, currency, status,
country, supplierProjectId, billingMode (project_level/survey_level), apiEnabled;
optional discountAmount, discountReason, publishedAt, supplierStatus, ipsosStatus,
approval.

- Status: pending_approval, approved, rejected.
- Supplier status: default/submitted; Ipsos status: pending/published/rejected.
- Approval: approved/rejected status, decidedAt, decidedByUserId, optional note.
- Only an owned pending record may be decided by an owned Admin. All selected IDs
  validate before mutation; duplicate IDs are deduplicated. API allows 1–100 IDs.
- Approve sets Ipsos published and publishedAt; reject sets Ipsos rejected. Both
  write decision metadata. UI does not accept notes despite API support.
- CPI, total and discount are displayed, not recalculated. Gross/net and Project
  allocation rules are not defined. Subsample Costs includes direct scope only.

## Fixtures and persistence

Base JSON counts: 1 supplier, 2 users, 50 projects, 180 Subsamples, 4 reports, 6 costs.
Project seed contains 20 Live, 14 Pending, 9 Closed and 7 Canceled; report seed covers all four report
statuses; cost seed has four pending, one approved, one rejected.

`fixture-store.ts` parses strict schemas and validates IDs/ownership, canonical
parents, scoped targets, requesters and approval actors/status. Fixtures are not
rewritten after saves. Runtime Contacts/Reports/Costs and recovery use global
process-local stores; restarting discards mutations. Read [handoff.md](handoff.md)
before changing contracts or seed data.

Project child counts span 1, 2, 3, 5 and 12. Synthetic metrics include zeros, large
counts and incidence boundaries. See [prototype-status.md](prototype-status.md).
