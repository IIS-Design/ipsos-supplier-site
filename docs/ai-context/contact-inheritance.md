# Default Contacts and inheritance

Default Contacts appears below User Management in Users & Permissions. These are
emails included by default for supplier projects; operational inheritance remains
**Supplier → Subsample**, with no Project intermediary or copied Project defaults.

## Model and sources

`SupplierContacts = SupplierContact[]`; each immutable contact has id, name, email
and optional userId. Portal-user selections are validated against the supplier’s
user directory, and their saved name/email are canonical snapshots. Standalone email
contacts have an empty name and no userId; legacy named standalone contacts retain
their labels. Active portal users and arbitrary valid email addresses
can coexist in one selection. Email normalization is case-insensitive; duplicates
are rejected. The limit is 80 contacts, preserving the prior total capacity.
There are no contact-role buckets or role-specific identity checks.

`SubsampleContactOverrides = string[]`. Missing/inherit resolves the latest supplier
defaults. Override resolves saved IDs from the supplier’s historical contact catalog;
an explicitly empty array means no contacts, never fallback. Replacing/removing a
default retains its old identity in the catalog, so custom selections remain independent.
Portal-user profile edits do not silently rewrite existing saved contact snapshots;
resaving a linked default captures the current profile and preserves old override IDs.

## UX and access

- Users & Permissions contains User Management and Default Contacts only. The latter
  uses a searchable shared Popover with checkbox choices, selected chips, remove
  buttons and an Add email address action (Enter also adds). Invalid/duplicate
  emails show shared inline errors. Save Defaults and Cancel commit/restore drafts.
- Subsample Contacts keeps the same default/custom toggle, Save/Cancel and dirty
  guard, using one contact picker rather than four role controls. Arbitrary emails
  are added at supplier level only; custom selections use known supplier contacts.
- Administrator management link targets `/settings/users#default-contacts-heading`.
  Browser deployment prefixes are applied by Next Link/request helpers.
- Same-supplier active Administrators manage defaults. Both roles can save owned
  Subsample contact selections; canonical parent/supplier/known-ID checks remain.
- RHF keepDirtyValues retains unsaved incoming-refresh drafts. Save/Cancel explicitly
  passes keepDirtyValues:false. Error feedback retains the draft.

## Storage and compatibility

The API URL and service/repository contracts retain their responsibilities. PUT
`/api/settings/contacts` accepts a flat contact array; Subsample Contacts accepts
inherit or override with a flat ID array. Defaults revalidate Users & Permissions
and Project layouts. No JSON writes occur at runtime; the existing process-local
supplier/Subsample/catalog store survives reload/navigation/HMR and resets on restart.

Seed contacts and the saved Subsample override were migrated without changing IDs,
email values or unrelated settings. Older process-local role groups are flattened
on adapter load, preserving contacts and explicit override selections. Legacy payloads
are not accepted for new writes. Existing defaults do not acquire unrelated users
automatically; users are offered as choices in the supplier editor.

## Verification

Contacts tests cover mixed sources, canonical linked-user data, foreign user IDs,
normalization/duplicates, legacy migration, authorization, atomic invalid selections,
default replacement/removal, empty overrides, return to inheritance and cloned reads.
The complete suite has 33 passing TAP results including the Contacts parent.

Browser verification on a fresh production instance confirmed mixed user/email
saves surviving reload, legacy custom selections remaining intact, inherited values
reflecting the new defaults and Cancel restoring custom mode. The existing dev
process may retain the prior API schema after HMR; restart it to refresh modules.
