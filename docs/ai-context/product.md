# Product context

Source verification: 2026-10-22. Start with [handoff.md](handoff.md) and
[feature-status.md](feature-status.md). Current implementation outranks historical intent.

## Purpose / users

B2B operational portal for sample suppliers participating in Ipsos research. Frequent
returning users need fieldwork monitoring, report requests, cost review and supported
default management. Not a marketing site, BI product or training experience.

- Administrator: operational access plus Organization Contacts and cost decisions.
- User: monitoring, reports, read-only cost decisions, owned Subsample Contacts edits.
- No self-registration or user-management lifecycle. Only fixture identities/roles exist.

## Current product decisions

- Projects is sole landing workspace with expandable Projects/Subsamples, recent
  reports and pending costs. Dashboard is removed.
- Projects provide context; Subsamples are operational. Project entry redirects to
  All Subsamples; it is not a second dashboard or standalone overview.
- Details/Field Progress show fixture metrics, attributes and quotas. Incidence is
  percent, LOI minutes. No live metric integration.
- Exactly Respondent Info, Survey Duration and Mini-Router Quota report types.
  Creation queues mock records; no executor. Finished downloads are synthetic samples.
- Admin decisions belong in main Costs; Subsample Costs is informational/direct-scope.
  No Project allocation or invoice behavior exists.
- Settings implements Organization Contacts only. Supplier defaults → Subsample
  independent overrides; no Project inheritance layer. Other technical sections/Docs
  are placeholders; other Settings screens are absent.
- Login/recovery is testable mock behavior with simulated email preview and process-local
  credentials. No real email, production identity or durable mutation storage.

## UX principles / boundaries

- Operational efficiency, clarity, hierarchy and familiar enterprise interactions over decoration.
- Preserve supported roles/types; unsupported screenshot content is not authorized scope.
- Make inherited/custom and pending/success/error states explicit. Empty custom
  contact role is intentional, not fallback.
- Operational feedback stays inline; prototype instructions use contextual floating tools.
- WCAG 2.2 AA/responsiveness remain targets with open gaps, not certifications.
- Absent user administration, MFA/SSO, integrations and generated exports are inventory
  boundaries, not a plan or authorization to implement them. See
  [prototype-status.md](prototype-status.md) and [known-issues.md](known-issues.md).
