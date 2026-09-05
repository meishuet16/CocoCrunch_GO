import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CocoCompanion } from './CocoCompanion';

it('renders the requested canonical context without drawing another mascot', () => {
  const html = renderToStaticMarkup(<CocoCompanion context="planning" size={96}/>);
  expect(html).toContain('coco-scene-planning.png');
  expect(html).toContain('data-context="planning"');
  expect(html).not.toContain('coco-shell');
});
it('explicit pose overrides the context for a meaningful reaction', () => {
  expect(renderToStaticMarkup(<CocoCompanion context="repair" pose="expression-proud"/>))
    .toContain('coco-expression-proud.png');
});
