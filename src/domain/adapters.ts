export type FeasibilityIssue = { id: string; severity: 'watch' | 'block'; label: string; detail: string; resolved: boolean };
export type PriceOption = { id: string; label: string; category: 'stay' | 'transit' | 'activity'; price: number; baseline: number; deal: string; fit: number; why: string; };
export type PhotoImportResult = { imported: number; grouped: number; source: 'metadata-adapter'; note: string; };

export const comparisonOptions: PriceOption[] = [
  { id: 'stay-central', label: 'Kanda pocket hotel', category: 'stay', price: 520, baseline: 680, deal: 'Save RM160 · refundable until Oct 08', fit: 91, why: 'Central enough for the slowest member and under the stay plan.' },
  { id: 'transit-pass', label: '7-day metro pass', category: 'transit', price: 118, baseline: 148, deal: 'Save RM30 · best for 4+ rides', fit: 84, why: 'Matches the plan density without adding a booking constraint.' },
  { id: 'food-tour', label: 'Small-group market tour', category: 'activity', price: 86, baseline: 110, deal: 'Save RM24 · 12:00 start', fit: 88, why: 'Food-first experience with a gentle start and clear end time.' },
];

export function checkFeasibility(): FeasibilityIssue[] {
  return [
    { id: 'transfer', severity: 'watch', label: 'Station → café transfer', detail: '18 min buffer · okay for the slowest member', resolved: true },
    { id: 'opening', severity: 'block', label: 'Market opening hours', detail: 'Move the floating market block after 10:00', resolved: false },
    { id: 'commitment', severity: 'watch', label: 'Family video call', detail: 'Protected at 20:30 · dinner can flex around it', resolved: true },
    { id: 'budget', severity: 'watch', label: 'Surprise budget', detail: 'RM120 reserved · do not spend it in the base plan', resolved: true },
  ];
}

export function importPhotoMetadata(): PhotoImportResult {
  return { imported: 18, grouped: 4, source: 'metadata-adapter', note: 'Prototype groups local metadata only; no photos or live EXIF service are uploaded.' };
}
