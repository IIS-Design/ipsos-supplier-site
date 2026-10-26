# Ipsos Supplier Portal

Running Next.js supplier-portal prototype. AI entry point:
[docs/ai-context/handoff.md](docs/ai-context/handoff.md).

## Development

`npm install`; `npm run dev`. Build: `npm run build`; serve build: `npm run start`.
Checks: `npm run typecheck`, `npm run lint`, `npm run test:contacts`,
`npm run test:recovery`, `npm run test:emails`, `npm run build`.

Read root AGENTS.md and installed Next.js docs before relevant API changes.
Production session operations require `MOCK_AUTH_SECRET`; see [.env.example](.env.example).
This does not make mock authentication production-safe.

## Current scope / safety

Projects is landing; Dashboard is removed. Project entry redirects to All Subsamples.
Details, Field Progress, direct Subsample Costs and saved Contacts are implemented.
Reports queue/view works; finished fixture downloads are synthetic CSVs. Main Costs
supports Admin decisions. Settings implements Organization Contacts only. Docs and
technical Configuration remain placeholders.

Mock users: admin@supplier.com, user@supplier.com. Before reset, any non-empty password
up to 128 characters works; after reset use the new password until server restart.
Recovery uses a simulated email preview; no real email is sent. Never use real credentials/data.

Mutations/passwords/inboxes are process-local, survive navigation/reload, reset on
restart and do not synchronize between server instances. No database, real report
executor or production identity. Prototype guidance uses dismissible, re-openable floating tools at bottom-right.

## Living documentation

- [Handoff and governance](docs/ai-context/handoff.md)
- [Feature inventory](docs/ai-context/feature-status.md)
- [Implemented scope](docs/ai-context/prototype-status.md)
- [Open issues](docs/ai-context/known-issues.md)
- [Actual routes](docs/ai-context/navigation.md)
- [Authentication](docs/ai-context/authentication.md)
- [Domain contracts](docs/ai-context/domain-model.md)
- [Design system](docs/ai-context/design-system.md)

Review all docs with behavior changes and update affected files in the same task.
Implementation responses end with `# Documentation Updates`, listing files/reasons
or `No documentation updates required.`

Email assets: [public/emails/README.md](public/emails/README.md). Prototype Tools
opens standalone email previews in new tabs; invitation/account previews are sample
content only. No real email or account lifecycle integration is implemented.

Testing seeds: 50 Projects and 180 Subsamples with varied child counts and boundary
metrics. Projects has 10/20/50 pagination, Expand/Collapse All and horizontal Activity
sidebar collapse with line tabs; tablet stacks content. Protected pages are white;
authentication remains light gray.
