import type { ProjectId, SubsampleId } from "./ids";

/** A record belongs to exactly one project or one subsample, never both. */
export type ProjectScope = {
  scopeType: "project";
  projectId: ProjectId;
  subsampleId?: never;
};

export type SubsampleScope = {
  scopeType: "subsample";
  subsampleId: SubsampleId;
  projectId?: never;
};

export type RecordScope = ProjectScope | SubsampleScope;

export type ReportScope = RecordScope;
export type CostScope = RecordScope;

/**
 * A Subsample setting either inherits its Supplier default or stores a local
 * override. The effective value is resolved by the settings/domain layer.
 */
export type SettingOverride<Value> =
  | { mode: "inherit" }
  | { mode: "override"; value: Value };