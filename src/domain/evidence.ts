export type EvidenceSource = 'tingo' | 'trip-vibe' | 'constraint' | 'member-preference' | 'group-consensus' | 'budget' | 'candidate' | 'adapter';
export type EvidenceStrength = 'required' | 'strong' | 'supporting' | 'context';
export type EvidenceEffect = 'supports' | 'protects' | 'excludes' | 'constrains' | 'warns';

export type RecommendationEvidence = {
  source: EvidenceSource;
  inputId?: string;
  strength: EvidenceStrength;
  effect: EvidenceEffect;
  value: string;
};
