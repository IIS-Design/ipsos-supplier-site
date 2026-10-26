export const BASE_PATH = "/supplier";

export function withBasePath(pathname: string): string {
  if (pathname === BASE_PATH || pathname.startsWith(`${BASE_PATH}/`))
    return pathname;
  return `${BASE_PATH}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}