import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  // Route handlers do not inherit the portal layout's authentication guard.
  await requireUser();
  const html = await readFile(
    path.join(process.cwd(), "docs/reviews/supplier-portal-product-review-2026-11-13.html"),
    "utf8",
  );
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
