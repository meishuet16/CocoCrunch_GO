import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PhotoJournalCapture } from './PhotoJournalCapture';

it('makes local-only photo handling explicit before Storage exists', () => {
  const html = renderToStaticMarkup(<PhotoJournalCapture destination="Tokyo" onIndex={() => undefined}/>);
  expect(html).toContain('Choose photos');
  expect(html).toContain('browser session');
  expect(html).toContain('does not upload photos');
});
