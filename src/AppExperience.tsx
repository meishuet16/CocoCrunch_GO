import { useEffect, useState } from 'react';
import App from './App';
import PackingReplica from './PackingReplica';
import SignatureRituals, { type Ritual } from './SignatureRituals';
import { subscribeExperience, type PrivacyLevel } from './experience';
import { playSound, unlockSound } from './sound';

export default function AppExperience() {
  const [ritual, setRitual] = useState<Ritual>(null);
  const [place, setPlace] = useState('this place');
  const [destination, setDestination] = useState('Tokyo');
  const [privacy, setPrivacy] = useState<PrivacyLevel>('status');
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const unlock = () => { void unlockSound(); };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => subscribeExperience(event => {
    switch (event.type) {
      case 'capture-place': setPlace(event.place); setRitual('capture'); playSound('capture'); break;
      case 'send-family-reassurance': setDestination(event.destination); setPrivacy(event.privacy); setDelayed(event.delayed); setRitual('courier'); playSound('courier'); break;
      case 'print-receipt': setRitual('receipt'); playSound('receipt'); break;
      case 'open-prayer': setRitual('prayer'); playSound('prayer-step'); break;
    }
  }), []);

  return <>
    <App />
    <PackingReplica />
    <SignatureRituals ritual={ritual} place={place} destination={destination} privacy={privacy} delayed={delayed} onClose={() => setRitual(null)} />
  </>;
}
