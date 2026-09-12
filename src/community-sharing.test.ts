import { describe, expect, it } from 'vitest';
import { buildPublicCommunityTrip } from './community-sharing';

describe('buildPublicCommunityTrip', () => {
  it('passes only per-card public memories into the Explore payload', () => {
    const result = buildPublicCommunityTrip({ published: true, id: 99, title: 'Tokyo', author: 'Mei', destination: 'Tokyo', artifacts: [{ id: 'private', title: 'Private tea', body: 'secret', source: '', locationLabel: 'Tokyo', audience: 'personal', isPublic: false }, { id: 'public', title: 'Public ramen', body: 'share', source: '', locationLabel: 'Tokyo', audience: 'personal', isPublic: true }] });
    expect(result?.memoryCards).toEqual([{ id: 'public', title: 'Public ramen', body: 'share', locationLabel: 'Tokyo', archiveDay: undefined, archivePlace: undefined }]);
    expect(JSON.stringify(result)).not.toContain('Private tea');
    expect(buildPublicCommunityTrip({ published: false, id: 99, title: 'Tokyo', author: 'Mei', destination: 'Tokyo', artifacts: [] })).toBeNull();
  });
});
