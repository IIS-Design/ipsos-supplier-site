import assert from "node:assert/strict";
import { test } from "node:test";
import { emailTemplates, renderEmailTemplate } from "../src/lib/email-templates";

const values = {
  logo_url: "https://portal.example.com/logos/ipsos-logo.png",
  action_url: "https://portal.example.com/reset-password?token=test&source=email",
  recipient_name: '<script>alert("test")</script>',
  invitation_expiry: "7 days",
  year: "2026",
};

test("all four email templates render complete branded HTML with escaped values", async () => {
  for (const template of emailTemplates) {
    const html = await renderEmailTemplate(template, values);
    assert.match(html, /<!doctype html>/i);
    assert.match(html, /name="viewport"/);
    assert.match(html, /role="presentation"/);
    assert.match(html, /alt="Ipsos"/);
    assert.match(html, /Ipsos Supplier Site<\/p>/);
    assert.match(html, /&copy; 2026 Ipsos/);
    assert.match(html, /source=email/);
    assert.match(html, /&amp;source=email/);
    assert.doesNotMatch(html, /\{\{|<script>/);
    if (template === "user-invitation" || template === "account-created")
      assert.match(html, /&lt;script&gt;/);
  }
});

test("email renderer rejects unsafe links and missing substitutions", async () => {
  await assert.rejects(renderEmailTemplate("reset-password", { ...values, action_url: "javascript:alert(1)" }), /HTTP/);
  const incomplete = { ...values } as Record<string, string>;
  delete incomplete.recipient_name;
  await assert.rejects(renderEmailTemplate("user-invitation", incomplete), /Missing email value/);
});
