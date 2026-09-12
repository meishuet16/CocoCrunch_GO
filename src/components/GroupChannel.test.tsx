import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupChannel } from './GroupChannel';
describe('GroupChannel', () => { it('renders a Court notification', () => { expect(renderToStaticMarkup(<GroupChannel unreadCount={1} onSend={() => undefined} onMarkRead={() => undefined} messages={[{ id: 'court', author: 'CocoCrunch', text: 'Group Court is open.', system: true, createdAt: 'Now' }]} />)).toContain('1 new notification'); }); });
