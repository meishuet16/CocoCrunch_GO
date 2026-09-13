import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CocoAssistantPrompt } from './CocoAssistantPrompt';

it('renders the concise Ask Coco chat entry', () => {
  const html = renderToStaticMarkup(<CocoAssistantPrompt mode="group" destination="Tokyo" onReviewProposal={() => undefined}/>);
  expect(html).toContain('Ask Coco');
  expect(html).toContain('Ask about your trip');
});

it('renders the 5 required quick prompt chips', () => {
  const html = renderToStaticMarkup(<CocoAssistantPrompt mode="solo" destination="Tokyo" onReviewProposal={() => undefined}/>);
  expect(html).toContain('🌟 Where to Go');
  expect(html).toContain('⚡ Pack My Day');
  expect(html).toContain('☕ Quick Detour');
  expect(html).toContain('⏭️ Skip to Next');
  expect(html).toContain('➕ Add Activity');
});

