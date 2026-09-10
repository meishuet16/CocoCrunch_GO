# COCOCRUNCH Travel Court — animated character pack

A drop-in React + TypeScript implementation for the Travel Court interaction.
No animation library is required: the characters are inline SVG, so they stay sharp and can animate by body part with CSS.

## Included

- `TravelCourtCharacter.tsx`
  - Judge + 6 traveler variants
  - states: `idle`, `support`, `objection`, `thinking`, `celebrate`
  - automatic breathing
  - automatic blinking
  - vote sign pop animation
  - celebration / gavel motion
- `CourtScene.tsx`
  - judge in the middle
  - dynamic members around the court
  - live YES/NO progress bar
  - destination case card
  - tap the current user's character or `Cast my vote`
  - bottom-sheet vote UI
- `travel-court.css`
  - all animation + layout styling
- `demo.tsx`
  - ready-to-copy example with 6 group members

## Install

Copy `src/TravelCourtCharacter.tsx`, `src/CourtScene.tsx`, and `src/travel-court.css` into your React project.

Then use:

```tsx
import { CourtScene, TripCourtMember } from './components/travel-court';

const members: TripCourtMember[] = [
  { id: 'me', name: 'You', variant: 'coral' },
  { id: 'a', name: 'Alex', variant: 'green', vote: 'yes' },
  { id: 'b', name: 'Ken', variant: 'blue', vote: 'no' },
  { id: 'c', name: 'June', variant: 'purple' },
];

<CourtScene
  destination="Jeju"
  destinationMeta="Beaches · Nature · Local food"
  imageUrl="/images/jeju.jpg"
  members={members}
  currentUserId="me"
  caseNumber={1}
  totalCases={3}
  onVote={(vote, reason) => {
    // call your API / Firestore here
    console.log(vote, reason);
  }}
/>
```

## Character-only usage

```tsx
<TravelCourtCharacter variant="blue" state="idle" size={120} />
<TravelCourtCharacter variant="green" state="support" vote="yes" size={120} />
<TravelCourtCharacter variant="purple" state="objection" vote="no" size={120} />
<TravelCourtCharacter variant="judge" state="celebrate" size={180} />
```

## Animation behavior

- `idle`: breathing loop + blink loop
- `support`: raises arm + green vote paddle
- `objection`: sharper raised-arm reaction + red X paddle
- `thinking`: head tilt + hand-to-chin pose
- `celebrate`: bounce / arm lift; judge also swings gavel
- on mount: small spring pop-in

Blink timing can differ per member using `blinkDelay`, which prevents all characters blinking at the same time.

## Hooking it to real-time group voting

The component currently keeps votes locally for the demo. In production, pass member vote values from your realtime backend and update them in `onVote`.

Suggested data shape:

```ts
{
  caseId: 'jeju-01',
  destination: 'Jeju',
  votes: {
    userA: 'yes',
    userB: 'no',
    userC: null
  }
}
```

When your backend pushes a vote change, update the `members` prop. The character can then switch from `idle/thinking` to `support/objection`.

## Design notes

The UI is intentionally clean and product-like: white-first surface, strong blue hierarchy, red only for disagreement, green only for approval, and the gamification lives mainly in the animated characters rather than filling the screen with decorative UI.
