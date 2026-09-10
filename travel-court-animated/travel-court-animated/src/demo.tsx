import React from 'react';
import { CourtScene, TripCourtMember } from './CourtScene';

const members:TripCourtMember[] = [
  { id:'me', name:'You', variant:'coral' },
  { id:'alex', name:'Alex', variant:'green', vote:'yes' },
  { id:'ken', name:'Ken', variant:'blue', vote:'no' },
  { id:'june', name:'June', variant:'purple', vote:'yes' },
  { id:'daniel', name:'Daniel', variant:'yellow' },
  { id:'sora', name:'Sora', variant:'navy' },
];

export default function TravelCourtDemo(){
  return (
    <CourtScene
      destination="Jeju"
      destinationMeta="Beaches · Nature · Local food"
      members={members}
      currentUserId="me"
      caseNumber={1}
      totalCases={3}
      onVote={(vote,reason)=>console.log('vote',vote,reason)}
    />
  );
}
