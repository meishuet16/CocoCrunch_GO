import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RecommendationEvidenceText } from './RecommendationEvidenceText';

describe('RecommendationEvidenceText', () => {
  it('formats structured evidence at the presentation boundary', () => {
    const html = renderToStaticMarkup(
      <RecommendationEvidenceText
        evidence={[
          { source: 'trip-vibe', effect: 'supports', strength: 'supporting', value: 'Food', inputId: 'trip-vibe' },
          { source: 'member-preference', effect: 'supports', strength: 'strong', value: 'Scenic café', inputId: 'member-cafe' },
        ]}
      />,
    );

    expect(html).toContain('trip vibe: Food');
    expect(html).toContain('member preference: Scenic café');
  });
});
