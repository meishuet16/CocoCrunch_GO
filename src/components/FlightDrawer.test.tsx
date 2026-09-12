import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FlightDrawer, parsePrototypeEmail } from './FlightDrawer';

describe('FlightDrawer', () => {
  it('parses simple prototype email fields with a truthful fallback', () => {
    expect(parsePrototypeEmail('SQ218 13 Oct 08:20 15:10 check-in 06:20')).toMatchObject({ flightNumber: 'SQ218', departureTime: '13 Oct · 08:20', arrivalTime: '13 Oct · 15:10' });
    expect(parsePrototypeEmail('forwarded confirmation')).toMatchObject({ flightNumber: 'MH 772' });
  });

  it('renders booked details and the group sharing control', () => {
    const html = renderToStaticMarkup(<FlightDrawer mode="group" draft="" onDraftChange={() => undefined} onConfirm={() => undefined} onClose={() => undefined} booking={{ flightNumber: 'MH 772', departureTime: '12 Oct · 09:15', arrivalTime: '12 Oct · 16:40', checkInTime: '12 Oct · 07:15', sharedWithGroup: false, source: 'email-prototype' }} />);
    expect(html).toContain('Booked for everyone');
    expect(html).toContain('MH 772');
  });
});
