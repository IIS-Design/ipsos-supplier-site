# Organization Contacts and inheritance

Source verification: 2026-10-22. Read [handoff.md](handoff.md) for maintenance rules.
Only Contacts currently implements a saved inheritance workflow.

## Scope / access

- `/settings/users`: Organization Contacts below User Management. Project Manager, Sales Contact, Finance
  Contact, Help Desk Contact. Zero to twenty contact objects per role; name/email validation.
- Only same-supplier Admin may view Settings/save defaults. Both roles may save
  owned Subsample Contacts. API/repository validate supplier, actor, canonical parent,
  known role-specific IDs and duplicate input. User still cannot access Settings.
- Page → services → contracts → mock repository; clients submit PUT handlers.
  `contact-model.ts` contains schemas, role labels and resolution helpers.

## Inheritance / identity

**Supplier Settings → Subsample**; no Project layer.

- Defaults: `SupplierContacts` contains contact objects per role.
- Subsample: missing, `{ mode: "inherit" }`, or `{ mode: "override", value }` with
  role → contact-ID arrays (`SubsampleContactOverrides`). Not copied contact objects.
- Missing/inherit resolves latest defaults when loaded; inherited display is read-only.
- Custom role resolves known IDs; missing/empty role means no contacts, never fallback.
- Editing defaults creates/reuses immutable identities. Old options remain available
  so replacement/removal of defaults does not change custom values. There is no
  separate contact-directory deletion/pruning interface.

## Editor / state behavior

- Organization: View → Edit → Save/Cancel; add/remove role rows.
- Subsample: OFF initially offers default IDs if no saved override; ON previews current
  defaults. Toggles change drafts only. Save commits mode and choices together;
  saving ON removes stored custom values. Cancel restores saved mode/choices.
- Admin Contacts links to Organization Contacts. Details summary reads saved mode only.
- RHF keepDirtyValues preserves incoming-refresh drafts; Save/Cancel explicitly
  override it to false. RHF 7.90 merges resetOptions into reset(); retain that fix.
- Both forms show dirty/saving/error/success and retain failed drafts. Route skeletons
  and retry boundaries cover initial reads. Storage caveats are in floating Prototype Tools, not inline boilerplate.
- Shared native-confirm guard also protects Reports; supported links/sections/selector/
  sign-out/history/unload are wired. It is not a router-level guarantee; repeated
  history cancellation/programmatic races lack automated coverage.
- Defaults revalidate Settings/Project layouts; Subsample saves revalidate its workspace.
  Read/refresh picks up saved data. No cross-tab push or concurrent-edit versions.
- `__ipsosSupplierContacts` global state clones seed suppliers/Subsamples/options;
  no JSON writes. Survives reload/navigation/HMR, resets on restart, not instance-shared.

## Verification

`npm run test:contacts`: 11 TAP results including parent. Tests cover authorization,
validation, custom persistence, unchanged identities after default edits/removal,
invalid IDs/foreign actor/wrong parent, explicit empty override, return to inheritance
and clone-isolated reads. Prior manual browser checks covered save/reload, Cancel,
warnings and failure drafts; no browser runner is committed. See
[known-issues.md](known-issues.md) for remaining focus/timeout/history caveats.
