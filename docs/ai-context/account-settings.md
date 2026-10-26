# Account Settings

/account is available to both Administrator and User through the desktop user-name/
role dropdown and the mobile hamburger. It is separate from organization Settings.
Desktop shows a User icon, name/role, and trailing ChevronDown as the trigger, with Account Settings, separator and
icon Sign Out. Mobile keeps identity, primary links, Account Settings, then a separated
Sign Out action. Mobile identity places the name on the left and role on the right,
vertically centered. Account Settings shares the primary link styling directly after
Settings (Docs for Users), with only one separator before Sign Out.
There are no nested menu levels. Radix DropdownMenu handles focus,
keyboard navigation and dismissal; mobile account/sign-out targets are at least 40px.

## Personal Information

Line-style tabs expose Personal Information and Security. The personal form uses
RHF/Zod and shared Input, FieldError and Button patterns. First/last names are trimmed,
required and limited to 100 characters. Email is trimmed/lowercased, validated and
limited to 254 characters. Save is disabled when unchanged/submitting; Cancel restores
the last saved values and clears feedback. Saving disables fields and actions, announces
progress, shows success/error feedback and retains failed edits.

The shared unsaved-changes guard covers links, reload/unload, browser traversal and
button-driven navigation/sign-out. Switching tabs uses the existing Radix AlertDialog to confirm discarding edits.
Cancel or a successful save clears dirty state. Links/sign-out/traversal use the same browser-confirm guard as Contacts, with
account-specific wording; section switching uses the shared in-app confirmation.

PUT /api/account identifies the actor from the session. Only firstName/lastName/email
are accepted; IDs, supplier and role are never client-controlled. Both roles can edit
only their own profile. Duplicate email (case-insensitive, across all supplier users)
returns 409; malformed input 400; no session 401; unexpected save failure 500. Server
validation is repeated in the mock adapter, with cloned results. Successful saves update
header context immediately and revalidate layouts. Session identity remains unchanged.

User records now share process-local mock storage used by all user lookup services.
Profiles survive navigation/reload and reset with the server, like other prototype
mutations. JSON fixtures are not rewritten. Email changes move an existing password
hash to the new address and invalidate reset tokens/preview receipts for old/new
addresses, preventing old reset links from changing the updated account. New sign-in
and recovery use the saved email. Email ownership verification/reauthentication and
durable profile storage are not implemented by this prototype.

## Security

Displays Password and ************, then Change Password. The action reuses the
existing password-recovery endpoint for the current saved email, including loading/
error feedback, and routes to the existing Check Your Email confirmation. Prototype
Tools there exposes only Open Reset Password Email; existing reset/update/success
screens complete the flow. No password is entered or saved on /account. No last-change
date is shown because that metadata is not available. No MFA, devices, recovery-method,
security-question or session-management UI is introduced.

## Validation

account.test.ts covers normalization/protected fields, supplier scoping, duplicate
email rollback, clone isolation, stable identity/role, password preservation and old
reset-link/preview invalidation. Browser checks cover menu navigation, form states,
header synchronization and the reset-email handoff. Native confirmation automation
was interrupted by an in-app browser dialog/CDP timeout; section switching now uses
the shared AlertDialog and needs a final manual keyboard/mobile check.
