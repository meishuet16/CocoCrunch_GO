import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

async function loadGlobalNav() {
  try {
    return await import('./GlobalNav');
  } catch {
    return null;
  }
}

function getNavButtons(node: ReactNode) {
  if (!isValidElement<{ children?: ReactNode }>(node)) {
    throw new Error('GlobalNav should render a nav element.');
  }

  return Children.toArray(node.props.children).filter(
    (child): child is ReactElement<{ className?: string; onClick: () => void }> => isValidElement(child),
  );
}

describe('GlobalNav', () => {
  it('keeps the five-item shell and active state', async () => {
    const mod = await loadGlobalNav();

    expect(mod).not.toBeNull();

    const { GlobalNav } = mod!;
    const nav = GlobalNav({
      tab: 'memories',
      onChange: () => undefined,
      onOpenTrips: () => undefined,
    });
    const html = renderToStaticMarkup(nav);
    const buttons = getNavButtons(nav);

    expect(buttons).toHaveLength(5);
    expect(html).toContain('Home');
    expect(html).toContain('Trips');
    expect(html).toContain('Explore');
    expect(html).toContain('Memories');
    expect(html).toContain('Me');
    expect(buttons.map(button => button.props.className ?? '')).toEqual(['', '', '', 'active', '']);
  });

  it('closes the workspace only when Trips is selected, then changes tabs', async () => {
    const mod = await loadGlobalNav();

    expect(mod).not.toBeNull();

    const calls: string[] = [];
    const { GlobalNav } = mod!;
    const nav = GlobalNav({
      tab: 'home',
      onChange: tab => calls.push(`tab:${tab}`),
      onOpenTrips: () => calls.push('close-workspace'),
    });
    const buttons = getNavButtons(nav);

    buttons[1].props.onClick();
    buttons[0].props.onClick();

    expect(calls).toEqual(['close-workspace', 'tab:trips', 'tab:home']);
  });
});
