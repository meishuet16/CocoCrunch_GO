import type { TingoBehavior } from './tingo';
import type { MemberPreferenceProfile } from './group-dna';

export type TripConstraint = { id: string; type: 'must-go' | 'deal-breaker' | 'preference' | 'flexible'; value: string; source: 'member' | 'ai'; };
export type TripMember = { id: string; name: string; role: string; inviteStatus: 'joined' | 'pending'; pace: 'slow' | 'steady' | 'fast'; preferenceProfile?: MemberPreferenceProfile; };
export type TripReminder = { id: string; label: string; date: string; kind: 'deposit' | 'cancel' | 'arrival' | 'custom'; done: boolean; };
export type HumanCommitment = { id: string; label: string; time: string; owner: string; fixed: boolean; };
export type ReunionAgreement = { time: string; place: string; tolerance: number; };
export type ResponsibilitySuggestion = { memberId: string; memberName: string; suggestedRole: string; reason: string; source?: 'member-tingo' | 'fallback' };

export const defaultMembers: TripMember[] = [
  {
    id: 'mei', name: 'Mei', role: 'Trip lead', inviteStatus: 'joined', pace: 'steady',
    preferenceProfile: {
      tingoAssessed: false,
      preferences: [{ id: 'mei-cafe', label: 'Scenic café', kind: 'preference', strength: 'optional', source: 'member' }],
      budget: { min: 600, max: 1000, sensitivity: 'medium' },
    },
  },
  {
    id: 'jh', name: 'JH', role: 'Food scout', inviteStatus: 'joined', pace: 'fast',
    preferenceProfile: {
      tingoAssessed: false,
      preferences: [{ id: 'jh-ramen', label: 'Ramen tonight', kind: 'preference', strength: 'strong', source: 'member' }],
      budget: { min: 500, max: 850, sensitivity: 'high' },
    },
  },
  {
    id: 'zishan', name: 'Zi Shan', role: 'Memory keeper', inviteStatus: 'joined', pace: 'slow',
    preferenceProfile: {
      tingoAssessed: false,
      preferences: [{ id: 'zishan-sushi', label: 'Sushi tonight', kind: 'preference', strength: 'strong', source: 'member' }],
      budget: { min: 700, max: 1100, sensitivity: 'medium' },
    },
  },
  { id: 'alex', name: 'Alex', role: 'Transit buddy', inviteStatus: 'pending', pace: 'steady', preferenceProfile: { tingoAssessed: false, preferences: [] } },
];

export function accommodationCancellationReminder(cancellationDeadline = 'Oct 08 · 23:59'): TripReminder {
  return { id: 'hotel-cancel', label: 'Accommodation cancellation window', date: cancellationDeadline, kind: 'cancel', done: false };
}

export const defaultReminders: TripReminder[] = [
  accommodationCancellationReminder(),
  { id: 'rail-deposit', label: 'Rail pass deposit', date: 'Oct 05 · RM120', kind: 'deposit', done: false },
  { id: 'arrival', label: 'Arrival check-in', date: 'Oct 12 · 16:00', kind: 'arrival', done: false },
];

export const defaultCommitments: HumanCommitment[] = [
  { id: 'video', label: 'Family video call', time: 'Oct 15 · 20:30', owner: 'Mei', fixed: true },
  { id: 'medicine', label: 'Medicine reminder', time: 'Daily · 08:00', owner: 'Zi Shan', fixed: true },
];

export const defaultReunion: ReunionAgreement = { time: '19:30', place: 'Shinjuku station west exit', tolerance: 15 };

export function slowestMemberMinutes(members: TripMember[]): number {
  return members.reduce((max, member) => Math.max(max, member.pace === 'slow' ? 1.35 : member.pace === 'fast' ? .9 : 1), 1);
}

const roleByBehavior: Record<TingoBehavior['groupRole'], [string, string]> = {
  connector: ['Group connector', 'This member’s Tingo profile is strongest at keeping everyone included.'],
  scout: ['Discovery scout', 'This member’s Tingo profile leans toward finding the next good idea.'],
  planner: ['Plan keeper', 'This member’s Tingo profile prefers context, structure, and protected commitments.'],
  independent: ['Flex keeper', 'This member’s Tingo profile values breathing room and can protect optional time.'],
};

const fallbackRoles: [string, string][] = [
  ['Food scout', 'No individual Tingo assessment is available yet, so Coco keeps this as an explicit fallback suggestion.'],
  ['Transit buddy', 'No individual Tingo assessment is available yet; this fallback keeps travel-time ownership visible.'],
  ['Memory keeper', 'No individual Tingo assessment is available yet; this fallback does not pretend to infer personality.'],
  ['Budget buddy', 'No individual Tingo assessment is available yet; this fallback only assigns a practical responsibility.'],
];

/** Advisory only. The optional member map prevents one traveller's personality from being projected onto everyone. */
export function suggestResponsibilities(members: TripMember[], behavior: TingoBehavior, memberBehaviors: Partial<Record<string, TingoBehavior>> = {}): ResponsibilitySuggestion[] {
  const joined = members.filter(member => member.inviteStatus === 'joined');
  return joined.map((member, index) => {
    const assessed = memberBehaviors[member.id] ?? (index === 0 ? behavior : undefined);
    if (assessed) {
      const [suggestedRole, reason] = roleByBehavior[assessed.groupRole];
      return { memberId: member.id, memberName: member.name, suggestedRole, reason, source: 'member-tingo' };
    }
    const [suggestedRole, reason] = fallbackRoles[(index - 1 + fallbackRoles.length) % fallbackRoles.length];
    return { memberId: member.id, memberName: member.name, suggestedRole, reason, source: 'fallback' };
  });
}

export function applyResponsibilitySuggestions(members: TripMember[], suggestions: ResponsibilitySuggestion[]): TripMember[] {
  const byId = new Map(suggestions.map(item => [item.memberId, item.suggestedRole]));
  return members.map(member => byId.has(member.id) ? { ...member, role: byId.get(member.id)! } : member);
}
