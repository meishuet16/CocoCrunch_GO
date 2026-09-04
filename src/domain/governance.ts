export type TripMode = 'group' | 'solo';
export type PlanMutationKind = 'official-itinerary' | 'personal-draft' | 'idea-save';

export type PlanMutationGate = {
  allowed: boolean;
  requiresGroupConfirmation: boolean;
  reason: string;
};

/**
 * Central guard for actions that can change shared trip truth.
 * Saving an idea or editing a personal draft is never an official group write.
 */
export function gatePlanMutation(mode: TripMode, kind: PlanMutationKind, groupConfirmed = false): PlanMutationGate {
  if (kind !== 'official-itinerary') {
    return { allowed: true, requiresGroupConfirmation: false, reason: kind === 'idea-save' ? 'Saved as an idea only; official itinerary is unchanged.' : 'Personal draft only; official itinerary is unchanged.' };
  }
  if (mode === 'solo') {
    return { allowed: true, requiresGroupConfirmation: false, reason: 'Solo traveller explicitly confirmed the official change.' };
  }
  if (!groupConfirmed) {
    return { allowed: false, requiresGroupConfirmation: true, reason: 'Official Group itinerary changes require group confirmation.' };
  }
  return { allowed: true, requiresGroupConfirmation: false, reason: 'Group confirmation recorded for the official change.' };
}
