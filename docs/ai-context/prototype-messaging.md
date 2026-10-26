# Prototype messaging

Prototype Tools is task-oriented. UI content contains useful page-specific actions,
not repository, storage, persistence or implementation explanations. Operational
errors/success and production-style email copy remain separate.

## Actions by screen

| Screen | Tools content |
| --- | --- |
| Login | Valid Credentials: admin@supplier.com, user@supplier.com; no extra guidance |
| Forgot Password Confirmation | Open Reset Password Email only |
| Reset Password | Open Reset Password Email |
| Password Updated | Open Password Changed Email |
| Reports | Open Sample Report; Show Empty Reports State / Restore Reports |
| Report creation | Open Sample Report |
| Projects | Reports: Show Empty Reports State / Restore Reports; Costs: Show Empty Costs State / Restore Costs |
| Costs | Show Empty Costs State / Restore Costs |
| Other routes | No trigger when there are no relevant actions |

Login starts collapsed; confirmation starts expanded without stealing focus. Other
Tools panels start collapsed. Panels open upward from a muted bottom-right trigger
and support close, Escape/outside dismissal, reopening and viewport scrolling.
Expired/invalid reset preview routes remain available for engineering validation,
but are no longer exposed as Tools actions. No Mock Inbox workflow exists.
Report downloads no longer open informational Tools panels automatically.

## Temporary empty previews

Root mounts PrototypeEnvironment. A pathname-keyed PrototypeStateProvider shares
local React state between Tools and the active module. Empty previews replace only
the displayed Reports/Costs arrays; fixtures, repositories and server records are
untouched. No requests or storage writes occur. Leaving the pathname or reloading
resets the preview. Module tabs can be tested while empty.

While previewing, Tools offers Restore Reports/Costs. A visible inline preview
notice provides the same Restore action even when Tools is closed. Restoring returns
to the latest supplied module data and retains the module's filters/tab choices.
Projects has separate local Reports/Costs Activity toggles. Each swaps only its widget
for the same widget with an empty array; Projects, Subsamples, and the other panel
remain unchanged. The two toggles can be enabled/restored independently via Tools.
Existing report creation and cost authorization/decision logic are unchanged.

## Badge and motion

The red badge precedes the Tools icon/label, with an accessible count and polite
atomic announcement. It counts primary page-specific entries; zero removes Tools.
Only badge numerals shimmer, once for four seconds on action availability identity
changes. Popover reopening does not replay it; reduced motion disables animation.
See [ShadCN shimmer-once](https://ui.shadcn.com/docs/utils/shimmer).

## Email previews

Reset email previews use the latest browser receipt; unknown accounts or missing/
expired receipts have no message. The preview query state=expired|invalid is still
supported for direct validation. Other templates use sample data. Templates live
under public/emails/; email links open a new tab with noopener/noreferrer.
Account Created and User Invitation assets remain engineering assets until those
workflows exist. Login credentials, mock lifecycle and persistence constraints are
engineering documentation concerns, not Tools content.
