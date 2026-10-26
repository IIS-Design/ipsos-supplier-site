import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/projects");

  return (
    <section
      aria-labelledby="login-heading"
      className="rounded-lg border bg-white p-6 shadow-sm sm:p-8"
    >
      <h1 className="text-2xl font-semibold tracking-tight" id="login-heading">
        Sign in
      </h1>
      <p className="mt-2 text-muted-foreground">
        Access your supplier workspace.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </section>
  );
}
