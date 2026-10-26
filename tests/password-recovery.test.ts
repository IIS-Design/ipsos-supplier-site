import assert from "node:assert/strict";
import { test } from "node:test";
import { MockRecoveryStore } from "../src/lib/auth/mock-recovery-store";
import {
  recoveryRequestSchema,
  resetPasswordSchema,
  resetRequestSchema,
} from "../src/lib/auth/recovery-validation";

test("recovery validates email and trims whitespace", () => {
  assert.equal(
    recoveryRequestSchema.parse({ email: " admin@supplier.com " }).email,
    "admin@supplier.com",
  );
  for (const email of [
    "",
    "not-email",
    "name @supplier.com",
    "x".repeat(255),
  ]) {
    assert.equal(recoveryRequestSchema.safeParse({ email }).success, false);
  }
});

test("passwords are required, bounded, and must match", () => {
  for (const value of [
    { password: "", confirmPassword: "" },
    { password: "one", confirmPassword: "two" },
    { password: "x".repeat(129), confirmPassword: "x".repeat(129) },
  ]) {
    assert.equal(resetPasswordSchema.safeParse(value).success, false);
  }
  assert.equal(
    resetPasswordSchema.safeParse({
      password: "new-password",
      confirmPassword: "new-password",
    }).success,
    true,
  );
  assert.equal(
    resetRequestSchema.safeParse({
      token: "bad",
      password: "new",
      confirmPassword: "new",
    }).success,
    false,
  );
});

test("known and unknown accounts both receive an opaque receipt; unknown accounts receive no mail", () => {
  const store = new MockRecoveryStore();
  const known = store.request("ADMIN@supplier.com", true);
  const unknown = store.request("unknown@supplier.com", false);
  assert.match(known, /^[a-f0-9]{64}$/);
  assert.match(unknown, /^[a-f0-9]{64}$/);
  assert.equal(store.inbox(known)?.email, "admin@supplier.com");
  assert.equal(store.inbox(unknown), null);
  assert.equal(store.inbox("another-browser"), null);
  assert.notEqual(known, store.inbox(known)?.token);
});

test("reset links expire at exactly 60 minutes, including after the form was loaded", () => {
  let now = 100000;
  const store = new MockRecoveryStore(() => now);
  const mail = store.inbox(store.request("user@supplier.com", true))!;
  assert.equal(store.status(mail.token), "valid");
  now += 60 * 60 * 1000;
  assert.equal(store.status(mail.token), "expired");
  assert.equal(store.reset(mail.token, "new-password"), "expired");
  assert.equal(
    store.acceptsPassword(mail.email, "initial-mock-password"),
    true,
  );
});

test("expired/invalid prototype links cannot reset passwords or invalidate the normal link", () => {
  const store = new MockRecoveryStore();
  const mail = store.inbox(store.request("user@supplier.com", true))!;
  assert.equal(store.reset(mail.expiredToken, "new-password"), "expired");
  assert.equal(store.status("invalid-prototype-link"), "invalid");
  assert.equal(store.reset("0".repeat(64), "new-password"), "invalid");
  assert.equal(store.status(mail.token), "valid");
});

test("successful reset changes mock sign-in, preserves other accounts and consumes every account link", () => {
  const store = new MockRecoveryStore();
  const mail = store.inbox(store.request("user@supplier.com", true))!;
  assert.equal(store.reset(mail.token, "new-password"), "valid");
  assert.equal(store.status(mail.token), "invalid");
  assert.equal(store.reset(mail.token, "second-password"), "invalid");
  assert.equal(store.acceptsPassword(mail.email, "new-password"), true);
  assert.equal(
    store.acceptsPassword("USER@supplier.com", "new-password"),
    true,
  );
  assert.equal(
    store.acceptsPassword(mail.email, "previous-mock-password"),
    false,
  );
  assert.equal(
    store.acceptsPassword("admin@supplier.com", "previous-mock-password"),
    true,
  );
});

test("a new request supersedes earlier links and enables another reset", () => {
  const store = new MockRecoveryStore();
  const first = store.inbox(store.request("user@supplier.com", true))!;
  const second = store.inbox(store.request("user@supplier.com", true))!;
  assert.equal(store.status(first.token), "invalid");
  assert.equal(store.reset(second.token, "replacement-password"), "valid");
  const third = store.inbox(store.request("user@supplier.com", true))!;
  assert.equal(store.reset(third.token, "next-password"), "valid");
  assert.equal(
    store.acceptsPassword(third.email, "replacement-password"),
    false,
  );
  assert.equal(store.acceptsPassword(third.email, "next-password"), true);
});

test("mail is scoped to its receipt, clones are isolated, and old inboxes expire", () => {
  let now = 100000;
  const store = new MockRecoveryStore(() => now);
  const receipt = store.request("user@supplier.com", true);
  const mail = store.inbox(receipt)!;
  mail.email = "modified@example.com";
  assert.equal(store.inbox(receipt)?.email, "user@supplier.com");
  now += 24 * 60 * 60 * 1000;
  assert.equal(store.inbox(receipt), null);
});
