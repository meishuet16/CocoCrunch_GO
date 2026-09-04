import type { RecommendationEvidence, ItineraryItem, TripPlan } from './itinerary';

export type BackupCandidate = {
  id: string;
  name: string;
  support: number;
  costDelta: number;
  timeDeltaMinutes: number;
  preferenceLoss?: number;
  viable: boolean;
  dealBreakerSafe: boolean;
  lossReason: string;
  source: 'court-loss' | 'destination-candidate' | 'ghost';
  evidence: RecommendationEvidence[];
};

export type CourtBackupOption = {
  id: string;
  label: string;
  support: number;
  viable?: boolean;
  dealBreakerSafe?: boolean;
  costDelta?: number;
  timeDeltaMinutes?: number;
  preferenceLoss?: number;
  lossReason?: string;
};

export type RepairMove = { itemId: string; fromMinutes: number; toMinutes: number };
export type RepairImpact = { costDelta: number; timeDeltaMinutes: number; preferenceLoss: number };
export type RepairResult = {
  applicable: boolean;
  requiresGroupConfirmation: boolean;
  failedItemId: string | null;
  replacement: BackupCandidate | null;
  movedItems: RepairMove[];
  impact: RepairImpact;
  protectedAnchorIds: string[];
  reasons: string[];
  preview: string[];
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function clock(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function matchesDealBreaker(label: string, dealBreaker: string): boolean {
  const rule = normalize(dealBreaker);
  const value = normalize(label);
  if (!rule) return false;
  if (/raw/.test(rule)) return /raw/.test(value);
  if (/red.?eye|overnight flight/.test(rule)) return /red.?eye|overnight/.test(value);
  return false;
}

export function promoteCourtLosers(options: CourtBackupOption[], winnerId: string, dealBreaker: string): BackupCandidate[] {
  return options
    .filter(option => option.id !== winnerId && option.support > 0 && option.label.trim() && option.viable !== false && option.dealBreakerSafe !== false && !matchesDealBreaker(option.label, dealBreaker))
    .map(option => ({
      id: option.id,
      name: option.label.trim(),
      support: option.support,
      costDelta: option.costDelta ?? 0,
      timeDeltaMinutes: option.timeDeltaMinutes ?? 0,
      preferenceLoss: option.preferenceLoss ?? 0,
      viable: true,
      dealBreakerSafe: true,
      lossReason: option.lossReason ?? 'Lost the Court vote.',
      source: 'court-loss' as const,
      evidence: [{ source: 'group-consensus', label: `${option.support} vote${option.support === 1 ? '' : 's'} retained`, detail: 'This alternative stayed in the Backup pool after losing the confirmed Court decision.' }],
    }));
}

function baseResult(plan: TripPlan, reason: string): RepairResult {
  const protectedAnchorIds = plan.items.filter(item => item.kind === 'anchor' && item.protected).map(item => item.id);
  return { applicable: false, requiresGroupConfirmation: false, failedItemId: null, replacement: null, movedItems: [], impact: { costDelta: 0, timeDeltaMinutes: 0, preferenceLoss: 0 }, protectedAnchorIds, reasons: [reason], preview: [`KEEP ${protectedAnchorIds.length} protected anchor${protectedAnchorIds.length === 1 ? '' : 's'}`, reason] };
}

export function buildMinimumLossRepair(input: { plan: TripPlan; failedItemId: string; backups: BackupCandidate[]; budgetRemaining: number; mode: 'group' | 'solo' }): RepairResult {
  const failed = input.plan.items.find(item => item.id === input.failedItemId);
  if (!failed) return baseResult(input.plan, 'The failed itinerary item is no longer present.');
  if (failed.kind === 'anchor' || failed.protected) return baseResult(input.plan, `Cannot replace protected anchor “${failed.name}”.`);

  const candidates = input.backups
    .filter(candidate => candidate.viable && candidate.dealBreakerSafe && candidate.costDelta <= input.budgetRemaining)
    .sort((left, right) => right.support - left.support || (left.preferenceLoss ?? 0) - (right.preferenceLoss ?? 0) || left.costDelta - right.costDelta || left.timeDeltaMinutes - right.timeDeltaMinutes || left.id.localeCompare(right.id));
  const replacement = candidates[0];
  const protectedAnchorIds = input.plan.items.filter(item => item.kind === 'anchor' && item.protected).map(item => item.id);
  if (!replacement) {
    return { ...baseResult(input.plan, 'No viable, budget-safe Backup candidate can replace this floating item.'), failedItemId: failed.id };
  }

  const impact = { costDelta: replacement.costDelta, timeDeltaMinutes: replacement.timeDeltaMinutes, preferenceLoss: replacement.preferenceLoss ?? 0 };
  const open = input.plan.items.find(item => item.kind === 'open' && item.id !== failed.id);
  const movedItems: RepairMove[] = open && impact.timeDeltaMinutes !== 0
    ? [{ itemId: open.id, fromMinutes: open.startMinutes, toMinutes: Math.max(open.startMinutes, open.startMinutes + impact.timeDeltaMinutes) }]
    : [];
  const requiresGroupConfirmation = input.mode === 'group' && Boolean(replacement);
  const reasons = [
    `Protected anchors first: ${protectedAnchorIds.join(', ') || 'none'}.`,
    `Selected ${replacement.name} because it has the highest viable Backup support at ${replacement.support}.`,
    `Loss reason retained: ${replacement.lossReason}`,
  ];
  const preview = [
    `KEEP ${protectedAnchorIds.length} protected anchor${protectedAnchorIds.length === 1 ? '' : 's'}`,
    `REPLACE ${failed.name} → ${replacement.name}`,
    ...movedItems.map(move => {
      const moved = input.plan.items.find(item => item.id === move.itemId);
      return `MOVE ${moved?.name ?? move.itemId} → ${clock(move.toMinutes)}`;
    }),
    `IMPACT ${impact.costDelta >= 0 ? '+' : ''}RM${impact.costDelta} · ${impact.timeDeltaMinutes >= 0 ? '+' : ''}${impact.timeDeltaMinutes} min · preference loss ${impact.preferenceLoss}`,
  ];
  return { applicable: true, requiresGroupConfirmation, failedItemId: failed.id, replacement, movedItems, impact, protectedAnchorIds, reasons, preview };
}

function updateMovedItem(item: ItineraryItem, move: RepairMove): ItineraryItem {
  if (item.id !== move.itemId) return item;
  const duration = item.endMinutes - item.startMinutes;
  return { ...item, startMinutes: move.toMinutes, endMinutes: move.toMinutes + duration, timeLabel: clock(move.toMinutes) };
}

export function applyRepairToPlan(plan: TripPlan, repair: RepairResult, groupConfirmed: boolean): { applied: boolean; plan: TripPlan; reason?: string } {
  if (!repair.applicable || !repair.replacement || !repair.failedItemId) return { applied: false, plan, reason: repair.reasons[repair.reasons.length - 1] ?? 'Repair is not applicable.' };
  if (repair.requiresGroupConfirmation && !groupConfirmed) return { applied: false, plan, reason: 'Group confirmation is required before applying this repair.' };
  const items = plan.items.map(item => {
    if (item.id === repair.failedItemId) {
      const repairEvidence: RecommendationEvidence = { source: 'constraint', label: 'Disruption repair', detail: repair.replacement!.lossReason };
      return { ...item, name: repair.replacement!.name, estimatedCost: item.estimatedCost + repair.impact.costDelta, evidence: [...item.evidence, ...repair.replacement!.evidence, repairEvidence] };
    }
    return repair.movedItems.reduce(updateMovedItem, item);
  });
  return { applied: true, plan: { ...plan, items, totalEstimatedCost: plan.totalEstimatedCost + repair.impact.costDelta, unresolvedRisks: plan.unresolvedRisks.filter(risk => !risk.toLocaleLowerCase().includes('failed')) } };
}
