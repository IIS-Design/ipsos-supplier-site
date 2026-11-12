import type {
  ProjectId,
  SupplierId,
  SurveyEventId,
} from "./ids";
import type { ProjectStatus } from "./status";

/** Project is the supplier-facing context for a Survey Event. */
export type Project = {
  id: ProjectId;
  supplierId: SupplierId;
  surveyEventId: SurveyEventId;
  name: string;
  status: ProjectStatus;
  billingEntity?: string;
  deviceCompatibility?: { mobile: boolean; tablet: boolean; desktop: boolean };
  categoryPaths?: string[][];
};