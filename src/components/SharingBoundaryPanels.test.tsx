import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FamilyWindowPanel, LocationPrivacyPanel } from './SharingBoundaryPanels';

const sharedProps = {
  privacy: 'status' as const,
  continuousLocation: false,
  reported: false,
  delayed: false,
  destination: 'Tokyo',
  onReviewLocation: () => undefined,
  onOpenFamily: () => undefined,
  onPrivacyChange: () => undefined,
  onSendReassurance: () => undefined,
};

describe('sharing boundary presentation', () => {
  it('makes Family Window a deliberate trip and safety preview', () => {
    const html = renderToStaticMarkup(<FamilyWindowPanel {...sharedProps} />);

    expect(html).toContain('FAMILY WINDOW');
    expect(html).toContain('Choose what family can see.');
    expect(html).toMatch(/Preview for family/i);
    expect(html).toContain('Review location privacy');
    expect(html).not.toContain('Exact location');
  });

  it('makes Location Privacy about data permission rather than family reassurance', () => {
    const html = renderToStaticMarkup(<LocationPrivacyPanel {...sharedProps} />);

    expect(html).toContain('LOCATION PRIVACY');
    expect(html).toContain('What location may CocoCrunch use?');
    expect(html).toContain('Manual check-in remains available');
    expect(html).toContain('Exact location · unavailable here');
    expect(html).toMatch(/sharing is managed separately/i);
    expect(html).not.toContain('Choose what family can see.');
  });
});
