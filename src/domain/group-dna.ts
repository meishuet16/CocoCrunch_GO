export type PreferenceKind = 'must-go' | 'strongly-avoid' | 'preference' | 'flexible';
export type PreferenceStrength = 'strong' | 'optional';
export type MemberPreference = {
  id: string;
  label: string;
  kind: PreferenceKind;
  strength: PreferenceStrength;
  source: 'member' | 'tingo' | 'trip';
};
export type MemberBudgetProfile = {
  min: number;
  max: number;
  sensitivity: 'low' | 'medium' | 'high';
};
export type MemberPreferenceProfile = {
  tingoAssessed: boolean;
  preferences: MemberPreference[];
  budget?: MemberBudgetProfile;
};
export type GroupMemberInput = {
  id: string;
  name: string;
  preferences: MemberPreference[];
  budget?: MemberBudgetProfile;
  tingoAssessed: boolean;
};
export type GroupSignal = {
  label: string;
  support: number;
  members: string[];
  strength: PreferenceStrength;
};
export type GroupConflict = {
  kind: 'strong-disagreement' | 'must-go-vs-strongly-avoid';
  label: string;
  members: string[];
  reason: string;
};
export type GroupDNA = {
  sharedPriorities: GroupSignal[];
  optionalPreferences: GroupSignal[];
  budgetRange: { min: number; max: number };
  budgetSensitivity: 'low' | 'medium' | 'high';
  conflicts: GroupConflict[];
  evidence: string[];
};

const sensitivityRank: Record<MemberBudgetProfile['sensitivity'], number> = { low: 1, medium: 2, high: 3 };

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function uniqueMembers(values: string[]): string[] {
  return [...new Set(values)];
}

function signalKey(preference: MemberPreference): string {
  return `${preference.kind}:${normalize(preference.label)}`;
}

/**
 * Derive group evidence only from explicit per-member inputs. Tingo assessment status is
 * recorded for transparency, but an assessed member never becomes a default for anyone else.
 */
export function deriveGroupDNA(members: GroupMemberInput[]): GroupDNA {
  const signals = new Map<string, GroupSignal>();
  const strongByKind = new Map<PreferenceKind, Map<string, GroupSignal>>();
  const mustGo = new Map<string, GroupSignal>();
  const stronglyAvoid = new Map<string, GroupSignal>();
  const evidence = members.map(member => member.tingoAssessed
    ? `${member.name}: Tingo assessed; only explicit member preferences are included.`
    : `${member.name}: not assessed; no Tingo preferences inferred.`);

  for (const member of members) {
    const seen = new Set<string>();
    for (const preference of member.preferences) {
      const key = signalKey(preference);
      if (seen.has(key)) continue;
      seen.add(key);
      const existing = signals.get(key);
      const next: GroupSignal = existing
        ? { ...existing, support: existing.support + 1, members: uniqueMembers([...existing.members, member.name]) }
        : { label: preference.label.trim(), support: 1, members: [member.name], strength: preference.strength };
      signals.set(key, next);

      if (preference.strength !== 'strong') continue;
      const byLabel = strongByKind.get(preference.kind) ?? new Map<string, GroupSignal>();
      byLabel.set(normalize(preference.label), next);
      strongByKind.set(preference.kind, byLabel);
      if (preference.kind === 'must-go') mustGo.set(normalize(preference.label), next);
      if (preference.kind === 'strongly-avoid') stronglyAvoid.set(normalize(preference.label), next);
    }
  }

  const conflicts: GroupConflict[] = [];
  for (const [label, must] of mustGo) {
    const avoid = stronglyAvoid.get(label);
    if (!avoid) continue;
    conflicts.push({
      kind: 'must-go-vs-strongly-avoid',
      label: must.label,
      members: uniqueMembers([...must.members, ...avoid.members]),
      reason: `${must.members.join(', ')} marked it Must-Go while ${avoid.members.join(', ')} marked it Strongly Avoid.`,
    });
  }

  for (const kind of ['must-go', 'preference'] as PreferenceKind[]) {
    const byLabel = strongByKind.get(kind);
    if (!byLabel || byLabel.size < 2) continue;
    const values = [...byLabel.values()].sort((a, b) => normalize(a.label).localeCompare(normalize(b.label)));
    for (let index = 0; index < values.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < values.length; nextIndex += 1) {
        const left = values[index];
        const right = values[nextIndex];
        conflicts.push({
          kind: 'strong-disagreement',
          label: `${left.label} vs ${right.label}`,
          members: uniqueMembers([...left.members, ...right.members]),
          reason: `Strong ${kind} signals point to different options; Coco will not average them.`,
        });
      }
    }
  }

  const conflictLabels = new Set(conflicts.filter(conflict => conflict.kind === 'must-go-vs-strongly-avoid').map(conflict => normalize(conflict.label)));
  const sharedPriorities = [...signals.entries()]
    .filter(([key, signal]) => signal.support >= 2 && signal.strength === 'strong' && !conflictLabels.has(normalize(signal.label)) && !key.startsWith('strongly-avoid:'))
    .map(([, signal]) => signal)
    .sort((a, b) => b.support - a.support || a.label.localeCompare(b.label));
  const optionalPreferences = [...signals.values()]
    .filter(signal => signal.strength === 'optional' && !conflictLabels.has(normalize(signal.label)))
    .sort((a, b) => b.support - a.support || a.label.localeCompare(b.label));

  const budgets = members.map(member => member.budget).filter((budget): budget is MemberBudgetProfile => Boolean(budget));
  const budgetRange = budgets.length === 0
    ? { min: 0, max: 0 }
    : { min: Math.min(...budgets.map(budget => Math.min(budget.min, budget.max))), max: Math.max(...budgets.map(budget => Math.max(budget.min, budget.max))) };
  const budgetSensitivity = budgets.reduce<MemberBudgetProfile['sensitivity']>((highest, budget) => sensitivityRank[budget.sensitivity] > sensitivityRank[highest] ? budget.sensitivity : highest, 'low');

  return { sharedPriorities, optionalPreferences, budgetRange, budgetSensitivity, conflicts, evidence };
}
