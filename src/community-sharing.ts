import type { PhotoMemoryArtifact } from './persistence';

export type PublicCommunityTrip = { id: number; title: string; author: string; match: number; saved: boolean; destination: string; memoryCards: Array<Pick<PhotoMemoryArtifact, 'id' | 'title' | 'body' | 'locationLabel' | 'archiveDay' | 'archivePlace'>> };

export function buildPublicCommunityTrip(input: { published: boolean; id: number; title: string; author: string; destination: string; artifacts: PhotoMemoryArtifact[] }): PublicCommunityTrip | null {
  if (!input.published) return null;
  return { id: input.id, title: input.title, author: input.author, match: 100, saved: false, destination: input.destination, memoryCards: input.artifacts.filter(artifact => artifact.isPublic).map(({ id, title, body, locationLabel, archiveDay, archivePlace }) => ({ id, title, body, locationLabel, archiveDay, archivePlace })) };
}
