export const FEATURES = {
  groupCourt: true,
  tieOnlyGacha: true,
  everydayGacha: true,
  tingoAssessment: true,
  tripSetup: true,
  deterministicAdapters: true,
  editableBudget: true,
  persistentCoreState: true,
  confirmedPreferenceLearning: true,
  destinationCatalog: true,
  disruptionRepair: true,
  familyWindow: true,
  captureCapsule: true,
  splitReceiptRitual: true,
  prayerRitual: true,
  memoryTrunk: true,
  ghostWish: true,
  futurePostcard: true,
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureEnabled(name: FeatureName): boolean {
  return FEATURES[name];
}
