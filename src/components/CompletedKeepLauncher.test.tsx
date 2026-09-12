import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompletedKeepLauncher } from './CompletedKeepLauncher';

it('keeps Completed artifact access compact without rendering artifact internals', () => {
  const html = renderToStaticMarkup(<CompletedKeepLauncher active={null} onOpen={() => undefined}/>);
  expect(html).toContain('KEEP TRIP');
  expect(html).toContain('Memory Trunk');
  expect(html).toContain('Photo Map');
  expect(html).toContain('Ghost Wishes');
  expect(html).toContain('Future Postcard');
  expect(html).toContain('TRIP RECAP');
  expect(html).not.toContain('GHOST WISH CEMETERY');
  expect(html).not.toContain('CATEGORY BUDGET');
});
