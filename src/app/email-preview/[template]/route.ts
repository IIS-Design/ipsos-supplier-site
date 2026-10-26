import { cookies } from "next/headers";
import { emailTemplates, renderEmailTemplate, type EmailTemplate } from "@/lib/email-templates";
import { getRecoveryMail } from "@/services/password-recovery-service";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  };
  if (!emailTemplates.includes(template as EmailTemplate))
    return new Response("Email preview not found.", { status: 404, headers });
  const origin = new URL(request.url).origin;
  let actionUrl = `${origin}/login`;
  if (template === "reset-password") {
    const receipt = (await cookies()).get("ipsos_prototype_email")?.value ?? "";
    const mail = getRecoveryMail(receipt);
    if (!mail) return new Response(
      '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Email unavailable</title></head><body style="font-family:Arial,sans-serif;margin:48px auto;padding:24px;max-width:480px;color:#172033"><h1>No email available</h1><p>Request a password reset using a prototype account to preview its email. Previous previews may have expired or the server may have restarted.</p><a href="/forgot-password">Request a new link</a></body></html>',
      { status: 404, headers },
    );
    const state = new URL(request.url).searchParams.get("state");
    const token = state === "expired" ? mail.expiredToken : state === "invalid" ? "invalid-prototype-link" : mail.token;
    actionUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
  }
  const html = await renderEmailTemplate(template as EmailTemplate, {
    logo_url: `${origin}/logos/ipsos-logo.png`,
    action_url: actionUrl,
    recipient_name: "Alex",
    invitation_expiry: "7 days",
    year: String(new Date().getFullYear()),
  });
  return new Response(html, { headers });
}
