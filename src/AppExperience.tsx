import { useEffect, useState } from 'react';
import App from './App';
import PackingReplica from './PackingReplica';
import SignatureRituals, { type Ritual, type Props as RitualProps } from './SignatureRituals';
import { subscribeExperience, type PrivacyLevel } from './experience';
import { playSound, unlockSound } from './sound';

export default function AppExperience() {
  const [ritual, setRitual] = useState<Ritual>(null);
  const [ritualPayload, setRitualPayload] = useState<Partial<RitualProps>>({});
  const [ritualKey, setRitualKey] = useState(0);
  const [packingVisible, setPackingVisible] = useState(false);
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
    setRitualKey(key => key + 1);
    switch (event.type) {
      case 'capture-place': setPlace(event.place); setRitualPayload({ capture: { place: event.place, save: event.save } }); setRitual('capture'); break;
      case 'release-wish': setRitualPayload({ release: { name: event.name, reason: event.reason, commit: event.commit } }); setRitual('release'); break;
      case 'send-family-reassurance': setDestination(event.destination); setPrivacy(event.privacy); setDelayed(event.delayed); setRitual('courier'); playSound('courier'); break;
      case 'print-receipt': setRitualPayload({ receipt: { total: event.total, participants: event.participants } }); setRitual('receipt'); break;
      case 'open-prayer': setRitualPayload({ prayer: { source: event.source, uncertainty: event.uncertainty } }); setRitual('prayer'); break;
      case 'open-packing': setPackingVisible(true); break;
      case 'close-packing': setPackingVisible(false); break;
    }
  }), []);

  return <>
    <App />
    <PackingReplica visible={packingVisible} onClose={() => { setPackingVisible(false); }} />
    <SignatureRituals key={ritualKey} {...ritualPayload} ritual={ritual} place={place} destination={destination} privacy={privacy} delayed={delayed} onClose={() => setRitual(null)} />
  </>;
}
