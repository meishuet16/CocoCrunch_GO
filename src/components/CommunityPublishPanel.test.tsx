import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CommunityPublishPanel } from './CommunityPublishPanel';

it('requires explicit public consent before a trip can be published', () => {
  const html = renderToStaticMarkup(<CommunityPublishPanel published={false} onChange={() => undefined}/>);
  expect(html).toContain('I confirm this trip can be public');
  expect(html).toContain('disabled');
  expect(html).toContain('Private by default');
});
