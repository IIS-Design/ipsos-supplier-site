import "server-only";

/** The trusted reverse proxy supplies public Host and X-Forwarded-* headers. */
export function getPublicOrigin(request: Request): string {
  if (process.env.APP_ORIGIN) return new URL(process.env.APP_ORIGIN).origin;

  const incoming = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim()
    || request.headers.get("host") || incoming.host;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim()
    || incoming.protocol.replace(":", "");
  if (protocol !== "http" && protocol !== "https")
    throw new Error("Public origin must use HTTP or HTTPS.");
  return new URL(`${protocol}://${host}`).origin;
}
