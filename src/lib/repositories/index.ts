import "server-only";

import type { PortalRepositories } from "./contracts";
import { mockRepositories } from "./mock/mock-repositories";

/** Central repository selection point; replace the mock adapter here for an API implementation. */
export function getRepositories(): PortalRepositories {
  return mockRepositories;
}
