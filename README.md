# Ipsos Supplier Site

Ipsos Supplier Site is a supplier-facing portal prototype for managing research work through Projects and Subsamples, reviewing operational reports, and handling cost approvals. It supports product and design validation with realistic sample data and working interactions, while external services and durable storage remain outside the current scope.

**Projects is the landing page.** Projects provide context; Subsamples are the primary operational entity. There is no separate Dashboard page.

## Features

- **Project exploration:** Live/Pending views, search, language and date-range filters, advanced Subsample status/remaining filters, expandable project cards, bulk expansion, and pagination with 10/20/50 items per page.
- **Subsample operations:** All Subsamples navigation, Details, Field Progress and quota metrics, directly scoped Costs, and editable Contacts. Supplier contact defaults inherit to Subsamples unless explicitly overridden.
- **Reports:** Create Respondent Info, Survey Duration, and Mini-Router Quota reports at Project or Subsample scope. Review History and Queue, inspect error details, and download the finished sample report. New requests enter the queue; report execution is not implemented.
- **Cost review:** Project- or Subsample-scoped records, filters, expandable details, approval history, and Administrator-only bulk approve/reject actions.
- **Account and organization settings:** Both roles can edit their own personal information and request a password change. Administrators can manage Organization profiles, Users & Permissions (including Organization Contacts), Survey Configuration, Respondent Redirects, Server-to-Server and Security through supplier Settings.
- **Authentication:** Sign-in, remembered sessions, password visibility controls, and a password-recovery flow using simulated email previews.
- **Contextual Prototype Tools:** Useful actions such as opening email previews or a sample report and toggling temporary empty states. Projects Activity previews can be switched independently and restored without changing fixture data.

The fixtures include 50 Projects and 180 Subsamples, with varied statuses, long names, different child counts, and edge-case metrics for testing layouts and filters.

## Screens

| Screen              | Entry point                                     | Current experience                                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projects            | `/projects`                                     | Primary workspace with project cards and switchable Costs/Reports Activity widgets. Each widget shows up to 10 entries, with links to its full module.                                                              |
| Subsample Workspace | Open a Subsample from Projects                  | Shared Project context and Subsample selector, with Details, Field Progress, Costs, Contacts, and Configuration sections. Configuration content remains a placeholder. Project entry opens its All Subsamples list. |
| Reports             | `/reports`, `/reports/create`                   | Report creation, History and Queue views, filtering, error details, and sample downloads. Queued/executing Activity entries open Queue; finished entries download directly.                                         |
| Costs               | `/costs`                                        | Pending Approval and History views. Both roles can inspect records; only Administrators can approve or reject.                                                                                                      |
| Settings            | `/settings`                                     | Administrator-only supplier settings: Organization, Users & Permissions (including Organization Contacts), Survey Configuration, Respondent Redirects, Server-to-Server, and Security.                                                                                                                          |
| Account Settings    | `/account`                                      | Personal Information and Security tabs, available from the desktop user dropdown or mobile hamburger menu.                                                                                                          |
| Authentication      | `/login`, `/forgot-password`, `/reset-password` | Sign-in, recovery confirmation, token-based password reset, and password-updated confirmation. Recovery emails open through Prototype Tools.                                                                        |

The header uses desktop navigation and an inline expanding hamburger menu on smaller screens. Account Settings and Sign Out are grouped with user actions. The protected `/docs` screen currently shows unavailable content.

## Tech Stack

| Technology                    | Use                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Next.js 16 / React 19         | App Router, server-rendered pages, interactive components, and API route handlers |
| TypeScript                    | Typed domain models, services, and repository contracts                           |
| Tailwind CSS 4                | Layout, responsive behavior, and styling                                          |
| ShadCN UI patterns / Radix UI | Local, customizable UI primitives and accessible interaction foundations          |
| Lucide                        | Icons                                                                             |
| Zod                           | Form, API, and fixture validation                                                 |
| React Hook Form               | Form state, validation integration, and submission states                         |

See [package.json](package.json) for dependency versions and scripts. Data access uses typed services and repositories backed by JSON fixtures and in-memory prototype state.

## Running Locally

### Prerequisites

- Node.js **20.9 or newer**; local verification has used Node.js 22.
- npm.

### Install and configure

From the repository root:

```sh
npm install
cp .env.example .env.local
```

Replace the example `MOCK_AUTH_SECRET` in `.env.local` with a long, random local value. Do not commit local secrets. Development has a fallback secret when none is configured; production-mode session operations require `MOCK_AUTH_SECRET`. Configuring it does not turn prototype authentication into a production identity system.

### Start development

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). Sign in with a demo account below to reach Projects.

### Build and serve locally

```sh
npm run build
npm run start
```

If a restricted environment blocks Turbopack worker-port access, the webpack build is available:

```sh
npm run build -- --webpack
```

### Quality checks

```sh
npm run typecheck
npm run lint
node --conditions=react-server --import tsx --test tests/*.test.ts
```

The full test command includes Contacts, recovery, email templates, Project filter boundaries, report identifiers, Account Settings, and Supplier Settings authorization/validation. Focused npm scripts are also available:

```sh
npm run test:contacts
npm run test:recovery
npm run test:emails
```

Browser validation is currently manual; there is no committed end-to-end browser test suite.

## Demo Credentials

| Email                | Role          | Access                                                                                   |
| -------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| `admin@supplier.com` | Administrator | Operational screens, Account Settings, Organization Contacts, and cost approvals         |
| `user@supplier.com`  | User          | Operational screens and own Account Settings; no organization Settings or cost decisions |

Before an account resets its password, **any non-empty password of up to 128 characters** is accepted—for example, `Prototype123!`. After a password reset, use the newly saved password. If you change your email in Account Settings, use that saved address to sign in.

Restarting the server restores the fixture profiles and default password behavior. Emails are simulated: request a reset, then use **Prototype Tools → Open Reset Password Email** on the confirmation screen. No real email is sent. Use sample information and passwords only.

## Project Structure

```text
src/app/          Routes, layouts, authentication screens, and API handlers
src/features/     Project, Subsample, Reports, Costs, Settings, and Account UI
src/components/   Shared UI primitives, authentication, navigation, and Tools
src/types/        Domain models and identifiers
src/data/         JSON sample fixtures
src/services/     Application data-access services
src/lib/          Repository adapters, sessions, recovery, and shared utilities
public/           Branding, reusable HTML emails, and sample report assets
docs/             Product, implementation, design, and onboarding documentation
tests/            Automated domain, validation, and service checks
```

Server pages read through services and repositories. Interactive forms submit to API handlers. Supplier ownership and role checks are enforced by the relevant server-side handlers and mutation repositories.

## Documentation

| Document                                                | Start here when you need…                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [AI handoff](docs/ai-context/handoff.md)                | AI onboarding, architecture context, established decisions, and documentation rules |
| [Prototype status](docs/ai-context/prototype-status.md) | A detailed account of implemented, partial, and absent behavior                     |
| [Feature inventory](docs/ai-context/feature-status.md)  | Feature-level scope and completion boundaries                                       |
| [Known issues](docs/ai-context/known-issues.md)         | Open UX, accessibility, responsive, and technical issues                            |
| [Navigation](docs/ai-context/navigation.md)             | Route and API details                                                               |
| [Design system](docs/ai-context/design-system.md)       | Shared visual and interaction conventions                                           |
| [Authentication](docs/ai-context/authentication.md)     | Sign-in, recovery, and session behavior                                             |
| [Account Settings](docs/ai-context/account-settings.md) | Profile editing and password-change behavior                                        |
| [Email assets](public/emails/README.md)                 | HTML template variables and engineering integration notes                           |

## Prototype Limitations

- **No durable backend:** Profile edits, contacts, cost decisions, reports, and recovery credentials are held in one server process. They can survive navigation and reloads, but reset on server restart and do not synchronize across instances. Runtime changes do not rewrite JSON fixtures.
- **No live report execution:** New reports remain queued. Executing, Finished, and Error examples are seeded states. Downloads contain a static synthetic CSV, not results generated from the requested options; failed reports have no retry action.
- **Limited integrations and settings:** No real email delivery, invitation acceptance, self-registration, invoicing, or external service integration. Settings invitations and integration credentials are simulated. Docs and technical Configuration editors remain placeholders. Settings changes use process-local mock storage; only Contacts has operational Subsample inheritance.
- **Prototype authentication:** No production identity provider, MFA, rate limiting, global session revocation, or email ownership verification. Account Settings is self-service profile editing, not a Users & Permissions administration module.
- **Validation gaps remain:** Session-expiry recovery, failed sign-out handling, some filter/empty-state combinations, unsaved-navigation edge cases, and accessibility/responsive behavior need further work. There is no formal accessibility certification or comprehensive browser regression suite.

See [Known issues](docs/ai-context/known-issues.md) for specific findings and evidence. An implemented prototype workflow should not be read as production readiness.

## Contributing

- Review the relevant product, feature, design, and known-issue documentation before changing behavior. Read [AGENTS.md](AGENTS.md); this Next.js version has local guides under `node_modules/next/dist/docs/` that should be checked before relevant API changes.
- Preserve the domain decisions: Projects provide context, Subsamples are operational, contact defaults inherit from Supplier to Subsample, and cost approvals are Administrator-only.
- Reuse shared UI primitives and form patterns. Keep authorization on the server and validate inputs at the relevant boundaries.
- Keep fixture relationships valid. Use representative sample data rather than real supplier or respondent information.
- Run checks appropriate to the change, add meaningful tests for changed behavior, and manually review affected screens and responsive states. Report what was verified and any remaining gaps.
- Update affected documentation in the same change. Clearly distinguish shipped behavior, placeholders, and future work.

## Source of Truth

**This README is the primary entry point for humans**: developers, designers, Product Managers, and stakeholders. It provides the product overview, setup steps, and current scope without requiring a tour of internal implementation notes.

**[docs/ai-context/handoff.md](docs/ai-context/handoff.md) is the primary onboarding document for AI agents.** It directs agents to the detailed context and working rules. The wider `docs/ai-context/` documentation records product and implementation decisions; the README summarizes those decisions rather than maintaining a separate roadmap.

If documentation conflicts with the running implementation, verify the relevant source and reconcile the affected documents. Do not infer shipped functionality from mockups or a feature marked complete without reading its stated boundary.

## Documentation Maintenance

README.md must remain aligned with implementation reality. Whenever **features, routes, workflows, or architecture change**, review whether this README needs an update and make any required changes in the same task or pull request.

Check the Features, Screens, setup commands, demo credentials, structure, and limitations against the final implementation. Update the relevant detailed documents alongside the overview, keep links valid, and remove claims that are no longer true. Avoid adding temporary test totals or treating planned work as implemented.

By IIS Design

Supplier Settings implementation and prototype boundaries are documented in
[Settings guide](docs/ai-context/settings.md).
