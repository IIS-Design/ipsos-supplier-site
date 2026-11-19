type SubsampleIdentity = { id: string; sampleOneId?: string };

/** Display SampleOne's numeric subsample ID without changing internal route keys. */
export function formatSubsampleId(identity: string | SubsampleIdentity): string {
  const id = typeof identity === "string" ? identity : identity.sampleOneId ?? identity.id;
  return /^subsample-\d+$/.test(id) ? id.slice("subsample-".length) : id;
}
