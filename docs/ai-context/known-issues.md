# Known issues

Source review: 2026-10-22. Open items only. This is not a feature roadmap. Working
prototype slices and absent integrations are distinguished in [prototype-status.md](prototype-status.md).
Severity reflects operational impact, not implementation complexity.

## UX / workflow

| ID    | Severity | Verified behavior / impact                                                                                                                                                                                                         | Evidence                                                                                                                                                  |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX-01 | High     | Session expiry lacks a consistent re-authentication/return path. Projects throws when its page sees no user; Reports uses not-found; Contact APIs explain expiry but drafts are not restored after sign-in.                        | `src/lib/auth/session.ts`, `src/app/(portal)/projects/page.tsx`, `src/app/(portal)/reports/page.tsx`                                                      |
| UX-02 | High     | Sign-out does not check HTTP success; rejected network promises have no visible recovery. A failed DELETE can be followed by a misleading local sign-out.                                                                          | `src/components/auth/mock-auth-provider.tsx`, `src/components/portal/primary-navigation.tsx`                                                              |
| UX-03 | Medium   | Reports empty wording checks search but not status/date restrictions. Queue also permits Finished/Error filters, yielding impossible result sets.                                                                                  | `src/features/reports/components/report-workspace.tsx`                                                                                                    |
| UX-04 | Medium   | Costs renders invalid-date alerts together with no-match empty states.                                                                                                                                                 | `src/features/costs/components/costs-workspace.tsx`                                             |
| UX-05 | Medium   | Costs filters clear selection without explaining the lost selection; Users receive no Administrator-only explanation for missing decision controls.                                                                                | `src/features/costs/components/costs-workspace.tsx`                                                                                                       |
| UX-06 | Medium   | Contacts, report creation and Costs requests lack timeouts. Contact Cancel and cost-dialog Cancel disable during submission, so stalled requests can leave an indefinite pending state. Recovery forms do have 15-second timeouts. | `src/features/contacts/contact-request.ts`, `src/features/reports/components/report-create-form.tsx`, `src/features/costs/components/costs-workspace.tsx` |
| UX-07 | Medium   | Report scope silently defaults to the first live Subsample (or first Project); the scope selector suggests search but is a plain Select.                                                                                           | `src/features/reports/components/report-create-form.tsx`                                                                                                  |
| UX-08 | Medium   | Subsample switching always opens Details, losing the current section. Landing filters/expansion are local state. Create New Report in the Projects widget opens Reports, not creation.                                             | `src/features/subsamples/components/project-context-panel.tsx`, `src/features/projects/components/recent-reports-widget.tsx`                              |
| UX-09 | Medium   | Cost confirmation identifies only record count, not targets/amounts. Total/discount gross-vs-net semantics are not explained; displayed totals are fixture values.                                                                 | `src/features/costs/components/costs-workspace.tsx`, `src/data/costs.json`                                                                                |
| UX-10 | Low      | Subsample Costs says approval is managed in Costs without a direct context-preserving action.                                                                                                                                      | `src/features/subsamples/components/costs-panel.tsx`                                                                                                      |

## Accessibility

| ID      | Severity | Verified gap                                                                                                                                                              | Evidence                                                                 |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| A11Y-01 | High     | Cost selection/expansion names repeat the Project name for different Subsamples; expansion state is on the row rather than its button, with no detail-region association. | `src/features/costs/components/costs-workspace.tsx`                      |
| A11Y-02 | Medium   | Report validation renders alerts without consistent `aria-invalid`/error associations or first-invalid-field focus.                                                       | `src/features/reports/components/report-create-form.tsx`                 |
| A11Y-03 | Medium   | Costs date filter labels remain screen-reader-only; Projects uses an accessible named Field end date range trigger.                                                                       | Projects explorer and Costs workspace                                    |
| A11Y-04 | Medium   | Organization Contacts Save/Cancel removes focused controls without restoring focus to Edit Defaults.                                                                      | `src/features/settings/components/organization-contacts.tsx`             |
| A11Y-05 | Medium   | Route-driven Subsample tabs and Costs view tabs do not have corresponding tabpanel relationships. Reports activity does use TabsContent.                                  | `src/features/subsamples/components/workspace-tabs.tsx`, Costs workspace |

No formal screen-reader/contrast/WCAG certification has been performed. Existing
labels, focus styling, role/status feedback and Radix primitives are not proof of full conformance.

## Responsive

- RSP-01 (Medium): primary navigation now uses an inline hamburger below 1024px,
  but full Project context still stacks before the Subsample task. Prior browser checks at 384×844 put the
  Subsample heading around 717px and tabs around 765px. No compact context behavior exists.
- Wide tables scroll horizontally; no sticky identifier column or overflow hint.
  Treat usability at very narrow widths as a validation gap, not proof of a broken table.
- Recent branded header/notification changes have not received a full breakpoint
  and assistive-technology regression pass.

## Technical / prototype limitations

- Process-local mutations, credentials and inboxes disappear on restart; no durable
  store, multi-instance consistency, cross-tab push or concurrent-edit versions.
- Report creation never advances beyond queued automatically. Existing Executing,
  Finished and Error entries are fixtures. Failed report rows have no retry action;
  report results are a static synthetic CSV, not generated from selected parameters.
- Reports and Pending Costs module lists render all supplied records; Projects Activity
  widgets cap their lists at 10. Projects and Costs History are paginated. Large-dataset performance beyond the synthetic fixtures remains
  unverified, not a measured regression.
- One-supplier fixtures do not prove tenant isolation comprehensively. Repository
  and API ownership checks exist; tests cover selected foreign-actor/path failures.
- Mock sign-in/recovery is not production authentication: no rate limiting, account
  lockout, real mail, durable credentials, or global session revocation. The public
  test preview can reveal simulated delivery; never use real accounts/data/passwords.
- Unsaved-change protection uses DOM events, native confirms and popstate recovery
  via pushState. It is not a Next router-level blocker; repeated history traversals,
  all programmatic-navigation paths and in-flight navigation races lack automated tests.
- Reset success and recovery confirmation pages are directly addressable; they are
  presentation states, not independent proof of a completed write.
- Contact options retain old identities so custom selections survive default edits;
  the editor has no separate contact-directory lifecycle or pruning UI.
- Dependency installation reported ESLint peer-version warnings and five high
  audit findings in the previous validation session. No dependency remediation or
  fresh audit was run in this documentation-only pass; inspect the current lockfile
  before attributing severity or affected packages.

Do not reopen fixed findings: the finished download asset exists; Project entry
redirects to All Subsamples; cost errors are inside dialogs; report drafts are
guarded; creation/approval/rejection have success feedback; Projects 1024px and
Costs 768px filter overflow was corrected; recovery and contact saves are implemented.
