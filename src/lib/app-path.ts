export const BASE_PATH = "/supplier";

export function withBasePath(pathname: string): string {
  // External downloads, mail links, and page fragments do not belong to the app.
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(pathname)) return pathname;
  if (pathname === BASE_PATH || ["/", "?", "#"].some(separator => pathname.startsWith(`${BASE_PATH}${separator}`)))
    return pathname;
  return `${BASE_PATH}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
