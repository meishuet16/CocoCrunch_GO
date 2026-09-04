import type { RecommendationEvidence } from '../domain/evidence';

export function RecommendationEvidenceText({ evidence }: { evidence: RecommendationEvidence[] }) {
  return <span>{evidence.map(entry => `${entry.source.replace('-', ' ')}: ${entry.value}`).join(' ')}</span>;
}
