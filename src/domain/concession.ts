import type { CourtVote } from './court';

export type CourtConcession = {
  id: string;
  offeredBy: string;
  description: string;
  linkedOptionId: string;
  status: 'attached' | 'fulfilled' | 'withdrawn';
  voteSnapshot: CourtVote[];
};

export function attachCourtConcession(
  votes: CourtVote[],
  input: Omit<CourtConcession, 'status' | 'voteSnapshot'>,
): CourtConcession {
  return {
    ...input,
    status: 'attached',
    voteSnapshot: votes.map(vote => ({ ...vote })),
  };
}

export function fulfillCourtConcession(concession: CourtConcession): CourtConcession {
  if (concession.status !== 'attached') return concession;
  return { ...concession, status: 'fulfilled' };
}

export function withdrawCourtConcession(
  concession: CourtConcession,
): { concession: CourtConcession; restoredVotes: CourtVote[] } {
  return {
    concession: { ...concession, status: 'withdrawn' },
    restoredVotes: concession.voteSnapshot.map(vote => ({ ...vote })),
  };
}
