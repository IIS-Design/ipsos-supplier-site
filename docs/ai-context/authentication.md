# Authentication — current mock implementation

Verified against source on 2026-10-23. This is a local testing system, not production
identity. No self-registration, real email delivery, lockout, SSO or MFA exists.

## Login

- `/login` uses the shared branded authentication layout and `LoginForm`.
- RHF + Zod: trimmed email, required, valid email format, maximum 254 characters;
  password required. Server rejects empty or >128-character passwords.
- Fixture users: `admin@supplier.com` (`admin`), `user@supplier.com` (`user`).
- Until an account resets its password, any non-empty password ≤128 characters
  works. After reset, only that account's new password works until server restart.
- POST `/api/auth/mock-session`: existing normalized email lookup, mock-password
  verification, session creation. Failures use generic 401; no account-existence hint.
- Client preserves email and clears password on failed sign-in, including network
  failures. The alert title stays `Unable to sign in`; messages can explain connection failure.
- Button shows Signing In while submitting; inputs have labels/error associations.
- Login, New Password and Confirm Password use the shared `PasswordInput` with
  independent Eye/EyeOff controls, keyboard access, Show/Hide labels and pressed state.
- Successful login replaces navigation with `/projects` and refreshes server data.
  An already signed-in visit to `/login` also redirects to Projects.

## Session handling / roles

Implementation: `src/lib/auth/session.ts`.

- Custom two-part `base64url(JSON payload).HMAC-SHA256 signature` token; it is not
  a standard JWT/JWS library format. Payload: userId, supplierId, expiresAt.
- Cookie `ipsos_supplier_session`: HttpOnly, SameSite=Lax, Path=/, Secure only when
  NODE_ENV=production. Default 8 hours; Keep Me Signed In sets 30 days. No rolling refresh.
- Secret: `MOCK_AUTH_SECRET`; a fixed fallback is used in development. Production
  session signing/verification requires the environment value. `.env.example` is a template.
- Verification checks timing-safe signature comparison and future integer expiry,
  then resolves the user through the supplier-scoped repository.
- `requireUser()` redirects unauthenticated portal access to `/login`.
  `requireAdministrator()` redirects non-admin users to `/projects`.
- Both roles read operational pages, create reports and save owned Subsample Contacts.
  Only Admin views Settings, saves Organization Contacts and decides Costs. APIs
  independently validate access; hiding navigation is not the security boundary.
- Sign-out DELETE clears this browser's cookie, then client navigates to Login.
  No server-side session registry or global invalidation. Expiry/failed-sign-out UX
  remains inconsistent; see [known-issues.md](known-issues.md).

## Recovery journey

1. `/forgot-password`: email form, client/server validation, submission loading and
   retryable errors. POST `/api/auth/password-recovery` looks up the fixture user.
2. The response is identical for known and unknown email addresses:

   > If an account exists for the email address provided, you will receive a password reset email shortly.

3. Success navigates to `/forgot-password/confirmation`. Its card shows neutral
   messaging with Back to Sign In and Use a Different Email only. Floating Prototype
   Tools expands by default with Open Reset Password Email only, linking
   to `/email-preview/reset-password` in a new tab. Login tools start collapsed; delivery is simulated.
4. The endpoint sets a random opaque receipt in `ipsos_prototype_email`:
   HttpOnly, SameSite=Lax, Secure in production, Path=/email-preview, TTL 24 hours.
   Receipt is not a reset token. Same-browser tabs share this cookie; a later request
   replaces the latest reset email selection. The preview is not user-login gated.
5. Known accounts get the approved simulated email; unknown emails get no message.
   The new-tab preview displays an unavailable state for absent/expired/restarted receipts.
6. Email button opens `/reset-password?token=…`. Valid token displays New Password
   and Confirm Password, independently toggleable visibility, field errors and saving state.
7. POST `/api/auth/reset-password` revalidates token at submission time and matching
   required passwords of 1–128 characters. Client handles invalid/expired links
   even when the token changed status after initial page load. Failure retains fields
   unless the token is terminal, when fields are cleared and link-state UI replaces them.
8. Success saves the mock credential, consumes account tokens, clears the current
   browser session, clears form values and replaces the URL with `/reset-password/success`.
9. Success explicitly confirms the update; Back to Sign In uses the new password.

Forms use a 15-second fetch timeout. Route loading skeletons and retryable error
boundaries cover recovery reads. Only Login automatically redirects authenticated
visitors; other auth pages remain accessible while signed in.

## Tokens, expiry and test controls

Implementation: `mock-recovery-store.ts` + `password-recovery-service.ts`.

- Crypto-random 32-byte tokens encoded as 64 hex characters; token lookup uses SHA-256 hash.
- Valid for 60 minutes, single-use. At expiry boundary status becomes expired.
- A new known-account request invalidates previous account tokens. Successful reset
  invalidates all tokens for that email; it does not affect another account's password.
- Missing/malformed/unknown/used token: Invalid reset link. Existing unused expired
  token: Reset link expired. Both provide Request a New Link and Back to Sign In.
- Expired/invalid email preview links remain direct validation routes, not Tools actions.
  The expired test token is
  real but already expired; it cannot reset a password and leaves the normal link valid.
  Invalid test link is deliberately malformed.
- Passwords use random salt + scrypt hash; no plaintext password storage. Raw reset
  tokens are retained only as part of the mock mail payload for displaying its button.
- Inbox/token maps are bounded and pruned during requests. Inbox TTL is 24 hours;
  older expired token entries may be pruned and then resolve as invalid.

## Approved simulated email

Subject and title: **Reset your password**

A request was received to reset the password for your
Ipsos Supplier Portal account.

Button: **Reset Password**

This link will expire in 60 minutes.

If you did not request a password reset,
you can safely ignore this email.

Ipsos Supplier Portal

Preserve this content. It is workflow communication, not removable prototype guidance.

## Branding and prototype communication

- Authentication layout uses `public/logos/ipsos-logo.png` at 56px beside “Supplier Site”, in one horizontal row centered above the card.
- No persistent mock-credential/limitation paragraphs in forms. Floating Prototype
  Tools offers page-specific actions and Valid Credentials account emails only.
  It opens upward at bottom-right, can be dismissed/reopened, and replaces prototype
  toasts. Email previews render standalone production-style HTML without portal chrome.
- Organization assistance appears below authentication cards in the shared layout,
  including Login, Forgot Password, Reset Password and Password Updated.
- Password length guidance, organization assistance, neutral confirmation, errors
  and success messages remain inline. See [prototype-messaging.md](prototype-messaging.md).

## Limitations / validation

- Do not use real credentials. Before-reset permissive mock login is intentional.
- No external identity provider, SMTP, real mailbox ownership verification, production
  password-strength policy, rate limiting, abuse protection or account lockout.
- Neutral public confirmation does not make the deliberately inspectable email preview
  safe against enumeration in a real system. Test controls must not be mistaken for
  production delivery/security.
- Passwords/tokens/inboxes are process-local and reset on restart; no multi-instance
  sharing. Existing sessions in other browsers are not revoked by password reset.
- Confirmation/success pages can be opened directly; they are not proof of a write.
- Recovery tests: `npm run test:recovery` (8). Coverage includes validation, unknown
  email, expiry, test tokens, single use, replacement requests, credential checking,
  receipt isolation/cloning/expiry. Contacts regression: `npm run test:contacts` (11
  TAP results including parent). Browser smoke checks previously passed the full journey.
- For current verification commands and documentation obligations, read [handoff.md](handoff.md).

## Email assets and validation

Four reusable transactional templates live in `public/emails/`: Reset Password, User
Invitation, Password Changed and Account Created. Preview GET `/email-preview/[template]`
uses the same HTML assets with escaped substitutions, allowlisted names and HTTP(S)
URLs. It returns private/no-store HTML with no-referrer/noindex and a restrictive CSP.
Reset previews use the latest receipt; other templates use synthetic sample data and
sign-in links. No real invitation/account-creation/delivery workflow is implied.
`public/emails/README.md` defines tokens and production mail integration requirements.
Authentication field messages share `components/ui/field-error.tsx` (rose text, alert
semantics and existing input associations), including “Enter a valid email address.”

## Account Settings

/account is available to both roles from the name/role desktop dropdown and the
mobile hamburger. Desktop Sign Out is inside the dropdown; mobile Account Settings
follows Settings (or Docs for Users) with the same navigation styling. A single
separator divides Account Settings from the icon Sign Out action at the bottom.
Line tabs provide Personal Information (first/last name, email; Save/Cancel, validation,
unsaved-change protection and async feedback) and Security (masked Password, Change
Password via the existing recovery-email flow). PUT /api/account only edits the
session actor, rejects protected fields and duplicate emails, and refreshes header
identity. Profile storage is process-local. Email changes preserve password hashes
and invalidate old reset links. No additional security/session-management features.
See account-settings.md for API behavior, constraints and validation.

Settings user management adds optional active/invited/inactive status to User. Missing
status means Active. Login and session resolution reject invited/inactive users; recovery
issues no new capability for them. Only active same-supplier Administrators manage users;
self-deactivation and self-demotion are blocked. Admin reset actions use the existing
receipt-scoped reset email preview. Invitations are staged, without an acceptance flow.

## Deployment URL behavior

The application is served under `/supplier/`. Login's Forgot Password action is a
Next.js Link so the prefix applies in both rendered HTML and client navigation.
Both self-service and administrator-triggered reset receipts use the
`/supplier/email-preview` cookie path. Email previews resolve absolute login,
reset and logo URLs from trusted public proxy headers or optional `APP_ORIGIN`,
not the container bind address. See the production handoff for proxy requirements.
