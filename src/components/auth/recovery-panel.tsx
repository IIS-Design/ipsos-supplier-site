import Link from "next/link";
import type { ReactNode } from "react";

export function RecoveryPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby="recovery-heading"
      className="space-y-5 rounded-lg border bg-white p-6 shadow-sm sm:p-8"
    >
      <h1
        className="text-2xl font-semibold tracking-tight"
        id="recovery-heading"
      >
        {title}
      </h1>
      {children}
    </section>
  );
}

export function SignInLink() {
  return (
    <Link
      className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      href="/login"
    >
      Back to Sign In
    </Link>
  );
}
