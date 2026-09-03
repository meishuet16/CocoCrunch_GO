import type { TingoBehavior } from './tingo';

export type TripConstraint = { id: string; type: 'must-go' | 'deal-breaker' | 'preference' | 'flexible'; value: string; source: 'member' | 'ai'; };
export type TripMember = { id: string; name: string; role: string; inviteStatus: 'joined' | 'pending'; pace: 'slow' | 'steady' | 'fast'; };
export type TripReminder = { id: string; label: string; date: string; kind: 'deposit' | 'cancel' | 'arrival' | 'custom'; done: boolean; };
export type HumanCommitment = { id: string; label: string; time: string; owner: string; fixed: boolean; };
export type ReunionAgreement = { time: string; place: string; tolerance: number; };
export type ResponsibilitySuggestion = { memberId: string; memberName: string; suggestedRole: string; reason: string };

export const defaultMembers: TripMember[] = [
  { id: 'mei', name: 'Mei', role: 'Trip lead', inviteStatus: 'joined', pace: 'steady' },
  { id: 'jh', name: 'JH', role: 'Food scout', inviteStatus: 'joined', pace: 'fast' },
  { id: 'zishan', name: 'Zi Shan', role: 'Memory keeper', inviteStatus: 'joined', pace: 'slow' },
  { id: 'alex', name: 'Alex', role: 'Transit buddy', inviteStatus: 'pending', pace: 'steady' },
];

export const defaultReminders: TripReminder[] = [
  { id: 'hotel-cancel', label: 'Hotel cancellation window', date: 'Oct 08 · 23:59', kind: 'cancel', done: false },
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

/**
 * Responsibility suggestions are advisory. They never silently overwrite a member's role;
 * the UI must preview them and require confirmation before applying.
 */
export function suggestResponsibilities(members: TripMember[], behavior: TingoBehavior): ResponsibilitySuggestion[] {
  const joined = members.filter(member => member.inviteStatus === 'joined');
  const primaryByBehavior: Record<TingoBehavior['groupRole'], [string, string]> = {
    connector: ['Group connector', 'Your Tingo profile is strongest at keeping everyone included.'],
    scout: ['Discovery scout', 'Your Tingo profile leans toward finding the next good idea.'],
    planner: ['Plan keeper', 'Your Tingo profile prefers context, structure, and protected commitments.'],
    independent: ['Flex keeper', 'Your Tingo profile values breathing room and can protect optional time.'],
  };
  const fallbackRoles: [string, string][] = [
    ['Food scout', 'A focused category makes group ownership visible without giving one person control of the itinerary.'],
    ['Transit buddy', 'Travel-time ownership helps the group respect the slowest member and reunion agreement.'],
    ['Memory keeper', 'One person can capture moments without changing official planning decisions.'],
    ['Budget buddy', 'A second pair of eyes can surface budget drift before it becomes a conflict.'],
  ];
  return joined.map((member, index) => {
    const [suggestedRole, reason] = index === 0 ? primaryByBehavior[behavior.groupRole] : fallbackRoles[(index - 1) % fallbackRoles.length];
    return { memberId: member.id, memberName: member.name, suggestedRole, reason };
  });
}

export function applyResponsibilitySuggestions(members: TripMember[], suggestions: ResponsibilitySuggestion[]): TripMember[] {
  const byId = new Map(suggestions.map(item => [item.memberId, item.suggestedRole]));
  return members.map(member => byId.has(member.id) ? { ...member, role: byId.get(member.id)! } : member);
}
