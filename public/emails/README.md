# Ipsos transactional email templates

Templates: `reset-password.html`, `user-invitation.html`, `password-changed.html`,
`account-created.html`. Subject lines match each HTML title. These are email assets,
independent of React, Tailwind or the portal shell. No JavaScript or external fonts.

All share a 560px fluid presentation-table layout, inline core styles, mobile
overrides, preheader, meaningful logo alt text, fallback action link and Outlook
conditional table/VML button markup. Test with your delivery provider and supported
mail clients before rollout; browser previews do not certify inbox rendering.

## Engineering substitutions

Replace every `{{variable}}` before sending. HTML-escape text/attribute values once.
Only permit trusted absolute HTTPS URLs for production links and logo hosting.

| Variable | Used by | Value |
| --- | --- | --- |
| `logo_url` | All | Absolute hosted Ipsos PNG URL |
| `action_url` | All | Real reset/invitation URL or portal sign-in URL |
| `recipient_name` | Invitation, Account Created | Recipient display name |
| `invitation_expiry` | Invitation | Product-approved expiry text |

Reset copy specifies a 60-minute expiry; keep the real token policy synchronized.
Supply text/plain alternatives through the mail provider. Never embed credentials.

## Prototype previews

Contextual Prototype Tools actions open the corresponding `/email-preview/<template>`
in a new tab. Reset is exposed in confirmation/reset workflows; Password Changed is
exposed on Password Updated. Account Created/Invitation assets have no matching
implemented workflow, so they are not advertised by unrelated Tools menus. Reset previews use
the latest browser receipt to render a real mock reset capability. Unknown-account,
missing, expired receipt and restarted-process requests show an unavailable state.
`?state=expired|invalid` on reset previews supports non-destructive link testing.
Other previews use synthetic names, a sample seven-day invitation expiry and a
sign-in action: invitation/account lifecycle and real email delivery are absent.
Do not send the preview substitution values or raw unrendered assets to real users.

Every email footer uses two lines: Ipsos Supplier Site / © 2026 Ipsos.
