import { useEffect, useState } from 'react';
import App from './App';
import SignatureRituals, { type Ritual } from './SignatureRituals';
import { subscribeExperience, type PrivacyLevel } from './experience';

export default function AppExperience() {
  const [ritual, setRitual] = useState<Ritual>(null);
  const [place, setPlace] = useState('this place');
  const [destination, setDestination] = useState('Tokyo');
  const [privacy, setPrivacy] = useState<PrivacyLevel>('status');
  const [delayed, setDelayed] = useState(false);

  useEffect(() => subscribeExperience(event => {
    switch (event.type) {
      case 'capture-place':
        setPlace(event.place);
        setRitual('capture');
        break;
      case 'send-family-reassurance':
        setDestination(event.destination);
        setPrivacy(event.privacy);
        setDelayed(event.delayed);
        setRitual('courier');
        break;
      case 'print-receipt':
        setRitual('receipt');
        break;
      case 'open-prayer':
        setRitual('prayer');
        break;
    }
  }), []);

  return <>
    <App />
    <SignatureRituals ritual={ritual} place={place} destination={destination} privacy={privacy} delayed={delayed} onClose={() => setRitual(null)} />
  </>;
}
