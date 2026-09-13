import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CocoAssistantPrompt } from './CocoAssistantPrompt';

it('renders the concise Ask Coco chat entry', () => {
  const html = renderToStaticMarkup(<CocoAssistantPrompt mode="group" destination="Tokyo" onReviewProposal={() => undefined}/>);
  expect(html).toContain('Ask Coco');
  expect(html).toContain('Ask about your trip');
});
