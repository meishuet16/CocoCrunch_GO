import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmergencyContactsManager } from './EmergencyContactsManager';
describe('EmergencyContactsManager', () => { it('shows per-contact delivery permissions and a frequency', () => { const html = renderToStaticMarkup(<EmergencyContactsManager contacts={[{ id: 'sam', name: 'Sam', contact: '+60 1', permission: 'both' }]} frequency={60} onChange={() => undefined} onFrequencyChange={() => undefined} />); expect(html).toContain('Location + message'); expect(html).toContain('Check-in frequency'); expect(html).toContain('Set your preferred contact and sharing permission.'); }); });
