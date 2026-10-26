import "server-only";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export type ResetLinkState = "valid" | "invalid" | "expired";
type ResetToken = { email: string; expiresAt: number; used: boolean };
export type MockRecoveryMail = {
  email: string;
  token: string;
  expiredToken: string;
  deliveredAt: number;
  expiresAt: number;
};
type Inbox = { expiresAt: number; mail: MockRecoveryMail | null };
const lifetime = 60 * 60 * 1000;
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const randomToken = () => randomBytes(32).toString("hex");

/** Mock-only. No SMTP, no disk storage, no plaintext password storage. */
export class MockRecoveryStore {
  private tokens = new Map<string, ResetToken>();
  private inboxes = new Map<string, Inbox>();
  private passwords = new Map<string, { salt: string; hash: Buffer }>();

  constructor(private now: () => number = Date.now) {}

  request(email: string, accountExists: boolean): string {
    const now = this.now();
    // Keep expired links available long enough to demonstrate the expired state.
    for (const [key, value] of this.inboxes)
      if (value.expiresAt <= now) this.inboxes.delete(key);
    for (const [key, value] of this.tokens)
      if (value.expiresAt < now - lifetime * 24) this.tokens.delete(key);
    while (this.inboxes.size >= 500)
      this.inboxes.delete(this.inboxes.keys().next().value!);
    while (this.tokens.size >= 1000)
      this.tokens.delete(this.tokens.keys().next().value!);
    const receipt = randomToken();
    let mail: MockRecoveryMail | null = null;
    if (accountExists) {
      const normalizedEmail = email.trim().toLowerCase();
      // Requesting another email invalidates earlier links for the same account.
      for (const entry of this.tokens.values())
        if (entry.email === normalizedEmail) entry.used = true;
      const token = randomToken();
      const expiredToken = randomToken();
      const expiresAt = now + lifetime;
      this.tokens.set(tokenHash(token), {
        email: normalizedEmail,
        expiresAt,
        used: false,
      });
      this.tokens.set(tokenHash(expiredToken), {
        email: normalizedEmail,
        expiresAt: now - 1,
        used: false,
      });
      mail = {
        email: normalizedEmail,
        token,
        expiredToken,
        deliveredAt: now,
        expiresAt,
      };
    }
    this.inboxes.set(receipt, { mail, expiresAt: now + lifetime * 24 });
    return receipt;
  }

  inbox(receipt: string): MockRecoveryMail | null {
    const inbox = this.inboxes.get(receipt);
    return inbox && inbox.expiresAt > this.now()
      ? structuredClone(inbox.mail)
      : null;
  }

  status(token: string): ResetLinkState {
    if (!/^[a-f0-9]{64}$/.test(token)) return "invalid";
    const entry = this.tokens.get(tokenHash(token));
    if (!entry || entry.used) return "invalid";
    return entry.expiresAt <= this.now() ? "expired" : "valid";
  }

  reset(token: string, password: string): ResetLinkState {
    const state = this.status(token);
    if (state !== "valid") return state;
    if (!password.length || password.length > 128)
      throw new Error("Invalid password.");
    const entry = this.tokens.get(tokenHash(token))!;
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64);
    this.passwords.set(entry.email, { salt, hash });
    for (const candidate of this.tokens.values())
      if (candidate.email === entry.email) candidate.used = true;
    return "valid";
  }

  renameAccountEmail(previousEmail: string, nextEmail: string) {
    const previous = previousEmail.trim().toLowerCase();
    const next = nextEmail.trim().toLowerCase();
    if (previous === next) return;
    const password = this.passwords.get(previous);
    this.passwords.delete(previous);
    this.passwords.delete(next);
    if (password) this.passwords.set(next, password);
    for (const entry of this.tokens.values())
      if (entry.email === previous || entry.email === next) entry.used = true;
    for (const [receipt, inbox] of this.inboxes)
      if (inbox.mail?.email === previous || inbox.mail?.email === next) this.inboxes.delete(receipt);
  }

  acceptsPassword(email: string, password: string): boolean {
    if (!password.length || password.length > 128) return false;
    const credential = this.passwords.get(email.trim().toLowerCase());
    // Preserve existing mock sign-in behavior until this account resets its password.
    if (!credential) return true;
    return timingSafeEqual(
      credential.hash,
      scryptSync(password, credential.salt, 64),
    );
  }
}

const recoveryGlobal = globalThis as typeof globalThis & {
  __ipsosMockRecovery?: MockRecoveryStore;
};
export const mockRecoveryStore = (recoveryGlobal.__ipsosMockRecovery ??=
  new MockRecoveryStore());
