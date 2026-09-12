import { describe, expect, it } from 'vitest';
import { parsePrototypeAccommodation } from './AccommodationDrawer';

describe('AccommodationDrawer', () => {
  it('uses parsed times when present and a truthful fallback otherwise', () => {
    expect(parsePrototypeAccommodation('Hotel: River House\nCheck-in 12 Oct 15:00\nCheck-out 17 Oct 11:00\nCancel by 09 Oct')).toMatchObject({ propertyName: 'River House', checkInTime: '12 Oct 15:00', checkOutTime: '17 Oct 11:00' });
    expect(parsePrototypeAccommodation('forwarded confirmation')).toMatchObject({ propertyName: 'Kanda pocket hotel' });
  });
});
