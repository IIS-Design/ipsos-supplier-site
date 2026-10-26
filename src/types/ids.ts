/** Brand strings so internal IDs and external business identifiers stay distinct. */
type Brand<Value extends string, Name extends string> = Value & {
  readonly __brand: Name;
};

export type SupplierId = Brand<string, "SupplierId">;
export type UserId = Brand<string, "UserId">;
export type ProjectId = Brand<string, "ProjectId">;
export type SubsampleId = Brand<string, "SubsampleId">;
export type ReportId = Brand<string, "ReportId">;
export type CostId = Brand<string, "CostId">;

/** External business identifiers; these are not interchangeable with ProjectId. */
export type SurveyEventId = Brand<string, "SurveyEventId">;
export type JobBookNumber = Brand<string, "JobBookNumber">;