import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CocoAssistantPrompt } from './CocoAssistantPrompt';

it('states that Coco prepares proposals rather than applying group changes', () => {
  const html = renderToStaticMarkup(<CocoAssistantPrompt mode="group" destination="Tokyo" onReviewProposal={() => undefined}/>);
  expect(html).toContain('Ask Coco about this trip');
  expect(html).toContain('does not make the change');
});
