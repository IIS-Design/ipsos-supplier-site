# Redirects and Server-to-Server

Approved second HTML review, implemented November 13, 2026. Source reference:
`redirect-links-s2s-doc-by-claude.html`. This document describes the prototype,
not a running RouterOne integration.

## Configuration

Supplier Settings remains Administrator-only. Respondent Redirects has nine
optional HTTP(S) URL templates, including Opt Out / Unsubscribe (100). The seven
S2S endpoints are unchanged. Shared labels distinguish Complete (3, 98), Screenout
(82), Quota Full (83), Sniff Out (81), Server Load (80, S2S only), Fraud/Suspicious
(99) and Opt Out (100). Redirect-only Device and Security show status 81 with
substatuses 48 and 47. Long Session is duration/page based, not status based.

Both Settings and Subsample Links include short descriptions and a keyboard/touch
accessible help popover. It explains <<UID>>, <<status>>, <<PID>>, unknown-token
empty substitution, and the redirect-only fixed %%...%% syntax. These are runtime
reference notes, not token execution or validation against live respondent data.
Field notes describe the approved fallback chains; no redirect resolver is built.

Subsample Links supports independent saved sections for Redirects and S2S:

- Use Supplier Defaults displays current supplier values read-only. No Project or
  parent/child supplier inheritance is introduced.
- Custom Override uses its own complete section values. Fields may be blank; blank
  values never merge with the corresponding supplier field. The runtime fallback
  notes describe downstream behavior rather than implementing it.
- Switching off defaults initially offers a snapshot of the displayed supplier
  URLs for editing; after saving, that snapshot is independent of later changes.
- Save Changes commits only the selected section to process-local mock storage;
  Cancel restores the saved section, including its inherited/custom mode.
- Re-enabling defaults and saving stores `mode: inherit`, removing active custom
  values for that section. The Details summary reports saved modes, not drafts.
- The shared leave guard warns on supported navigation and browser reload while
  dirty. Saving disables controls; failures retain drafts for retry.

Subsample S2S adds HTTP Method: GET, POST, PUT, PATCH. Inherited mode displays POST
as the provisional default. Only the Subsample override has an editable method;
there is no supplier-level method editor yet. Pixel HTML remains a plain textarea
and is never rendered or executed.

Settings S2S retains existing rerouting controls under Respondent Routing. Help
states that its minutes/attempts do not control HTTP notification retries. Whether
suppliers should have any routing controls remains under discussion; do not treat
these controls as finalized permissions or add actual S2S retries.

## Contracts and validation

`integration-model.ts` owns field catalogues, labels/notes, shared URL schemas and
strict override/request schemas. URL values allow empty strings or HTTP(S) URLs
up to 2048 characters. Token templates are allowed in the path/query, not the host
or protocol. Malformed angle tokens, unsupported schemes and literal whitespace
are rejected without DNS lookups or network calls. Legacy FTP/200-character rules
were not adopted. Settings and Subsample forms use the same URL schema; field-level
errors have accessible associations. Unknown-but-well-formed token names remain
permitted because no complete live token catalogue exists.

`PUT /api/projects/[projectId]/subsamples/[subsampleId]/links` accepts:

- `{ section: "redirects", setting: { mode: "inherit" } | { mode: "override", value: RedirectValues } }`
- `{ section: "server-to-server", setting: { mode: "inherit" } | { mode: "override", value: ServerToServerValues } }`

RedirectValues has all nine URL fields; ServerToServerValues has the seven endpoint
fields plus method and pixel. Both existing active roles can save owned Subsample
sections. API and repository enforce supplier ownership, canonical Project/child
membership, actor activity and strict schema validation before mutation. A save
preserves contacts and every other section. Reads/results are cloned. Development
fixture refresh now preserves saved link settings as well as saved contacts.

Older supplier preference objects are read with an empty optOut field added so
HMR does not discard other saved preferences. JSON fixtures are never rewritten.
Process restart discards these saves, as with other prototype settings.

## Prototype Tools and verification

Redirects/S2S previews include Supplier defaults, Custom Override, URL placeholders
and Invalid URL. Preview edits stay local and expose no Save action; Current data
restores saved configuration. Changing previews respects the leave guard on real
drafts. Entry Links previews are unaffected.

Automated tests cover templates/unsafe URLs, strict methods/request shapes,
section isolation, independent blanks, inheritance reset, actor/supplier/project
boundaries, cloned results, and preservation after development fixture refresh.
Browser checks covered inline errors, token URL saves and reload, Cancel, inherited
POST/custom PATCH, reset to defaults, help popovers, Settings labels/routing copy,
and the invalid-URL preview restoring Current data. Desktop and a 390px viewport
were inspected; the temporary viewport was reset and test configuration returned
to inherited mode.

## Deliberately deferred

No redirects, HTTP calls, retries, pixels, template substitutions or fallback engine
execute. No durable backend, child-supplier hierarchy, redirect hashing, timeout,
content-type editor, Parse ID or network tester is added. Source/Secret Key settings
are unchanged and are not reinterpreted as redirect-signing credentials.

## UI writing

Use brief notes for essential field semantics and popovers for longer references.
Avoid the long dash character in new UI text. Do not place pending product decisions
or implementation details in user-facing help.
