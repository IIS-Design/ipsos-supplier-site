# Development rules

Read [handoff.md](handoff.md) first, including Documentation Rules. These are
contribution conventions; [feature-status.md](feature-status.md) states what exists.

## Language

All deliverables outside the chat must be in English: code, comments, UI copy,
documentation, reports, changelog entries and team-facing messages. Conversation
with the user may remain in Spanish. Do not infer the deliverable language from
the language of the chat.

## Framework / UI

- Follow root AGENTS.md and installed Next.js docs before relevant API work. Current
  Next 16.4.2 differs from older releases, including error-boundary `retry`.
- Strict TypeScript, App Router, Tailwind v4, existing ShadCN-style Radix primitives,
  Lucide, RHF, Zod, Sonner. Reports currently uses local state + Zod rather than RHF.
- Inspect local primitive props; Button has default/sm sizes, not all upstream sizes.
- TanStack Table and React Query are not installed or mandatory migration tasks.
  Lists/Table primitives use local state; Projects has 10/20/50 pagination and
  Costs History has ten-row pagination. Reports/Pending Costs are not paginated.
- Preserve enterprise task-oriented layouts, clarity and experienced-user efficiency.
  No marketing UI, decorative dashboards, unrequested frameworks or scope expansion.

## Data boundaries

Server page → service → repository contract → selected mock adapter → validated
JSON seed/process state. Clients submit through route handlers. Do not import JSON into UI.

- Actual service example: `src/services/project-service.ts`, not lib/api/projects.
- Preserve supplier ownership, canonical Subsample.projectId, branded IDs and
  exclusive Project-or-Subsample Cost scope; Reports also supports multiple subsamples and supplier-wide scope (see handoff). Validate access at API and mutation boundaries.
- Schema/type changes require matching fixtures and relationship checks. Runtime
  saves do not rewrite JSON. Do not store real credentials/respondent data in mocks.
- Contacts, Redirects and S2S have process-local saved Supplier-to-Subsample inheritance. Other reserved override types do not imply editors. See redirects-s2s.md.
- Reports queue creation is not execution. Costs display supplied values; do not
  invent allocation, aggregation, invoice or discount rules.

## Interaction and quality

- Avoid the long dash character in new UI copy. Add brief field notes or accessible help popovers when they explain a difficult concept, without cluttering the workflow.
- Keep loading, empty, recoverable error and success states task-specific. Do not
  replace operational feedback with prototype guidance.
- Preserve Save/Cancel/draft warnings. RHF 7.90 merges resetOptions; pass
  keepDirtyValues=false explicitly for discarded/committed resets.
- Shared native-confirm hook is not a universal router blocker; wire new leave paths.
- Use labels, error associations, visible focus, keyboard access, text plus color
  statuses and reduced motion where applicable. WCAG 2.2 AA is a target, not certification.
- Desktop-first: validate affected layouts at desktop/laptop/tablet and narrow widths.
  Distinguish nested container space from viewport breakpoints.
- Branding/messaging: [design-system.md](design-system.md),
  [prototype-messaging.md](prototype-messaging.md). Keep floating guidance dismissible/re-openable; no unsolicited prototype toasts. The explicitly approved Reports duplicate-request preview uses a top-center operational toast.

## Verification and documentation

- Relevant tests plus `npm run typecheck`, `npm run lint`, `npm run build` for code
  changes. Existing suites: `npm run test:contacts`, `npm run test:recovery`.
- State actual verification performed. Manual browser checks are not committed automation.
- HMR has served stale new routes/methods; restart next dev if needed, remembering
  restart discards mock mutations/passwords. Do not weaken validation to mask stale code.
- Review all documentation with each behavior change; update affected documents in
  the same task. End implementation responses with `# Documentation Updates`, listing
  files/reasons or `No documentation updates required.` Follow handoff.md in full.

Email template checks: `npm run test:emails` (2 tests: all four renders/escaping,
unsafe links and missing values). Full current suites total 21 TAP results including
the Contacts parent. Build uses `next build --webpack` in this environment because
Turbopack worker-port binding was restricted in the preceding validation session.
