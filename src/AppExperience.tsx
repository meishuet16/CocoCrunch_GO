import { useEffect, useState } from 'react';
import App from './App';
import SignatureRituals, { type Ritual } from './SignatureRituals';

type Privacy = 'status' | 'area' | 'exact';

export default function AppExperience() {
  const [ritual, setRitual] = useState<Ritual>(null);
  const [place, setPlace] = useState('this place');
  const [destination, setDestination] = useState('Tokyo');
  const [privacy, setPrivacy] = useState<Privacy>('status');
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const capture = target.closest('article.community-row button:first-of-type');
      if (capture && !capture.textContent?.includes('✓')) {
        const card = capture.closest('article.community-row');
        setPlace(card?.querySelector('b')?.textContent?.trim() || 'this place');
        setRitual('capture');
        return;
      }

      if (target.closest('.courier-button')) {
        const activePrivacy = document.querySelector('.privacy-grid button.active')?.textContent?.trim();
        setPrivacy(activePrivacy === 'Approx. area' ? 'area' : activePrivacy === 'Exact location' ? 'exact' : 'status');
        setDestination(document.querySelector<HTMLInputElement>('input[placeholder*="Tokyo"]')?.value?.trim() || 'Tokyo');
        setDelayed(Boolean(document.querySelector('.live-map.rain')));
        setRitual('courier');
        return;
      }

      if (target.closest('.receipt-button')) {
        setRitual('receipt');
        return;
      }

      if (target.closest('.disruption-stage .action-row .primary')) {
        window.setTimeout(() => setRitual('prayer'), 180);
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return <>
    <App />
    <SignatureRituals ritual={ritual} place={place} destination={destination} privacy={privacy} delayed={delayed} onClose={() => setRitual(null)} />
  </>;
}
