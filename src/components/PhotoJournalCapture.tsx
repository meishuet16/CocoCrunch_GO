import { useState } from 'react';
import * as exifr from 'exifr';

export type PhotoJournalEntry = { name: string; takenAt: string; note: string; latitude?: number; longitude?: number; timeSource: 'exif' | 'fallback'; locationSource: 'exif' | 'fallback'; archiveDay?: number; archivePlace?: string };

export function PhotoJournalCapture({ destination, onIndex, groupMode = false, tripStart, places = [], onSaveMoment }: { destination: string; onIndex: () => void; groupMode?: boolean; tripStart?: string; places?: string[]; onSaveMoment?: (entry: PhotoJournalEntry, audience: 'personal' | 'group') => void }) {
  const [entries, setEntries] = useState<PhotoJournalEntry[]>([]);
  const [note, setNote] = useState('');
  const [audience, setAudience] = useState<'personal' | 'group'>('personal');

  async function capture(files: FileList | null) {
    if (!files?.length) return;
    const captured = await Promise.all(Array.from(files).map(async file => {
      const metadata = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate', 'latitude', 'longitude']).catch(() => undefined);
      const capturedAt = metadata?.DateTimeOriginal ?? metadata?.CreateDate;
      const latitude = typeof metadata?.latitude === 'number' ? metadata.latitude : undefined;
      const longitude = typeof metadata?.longitude === 'number' ? metadata.longitude : undefined;
      const archiveDay = capturedAt && tripStart ? Math.max(1, Math.floor((capturedAt.getTime() - new Date(`${tripStart}T00:00:00`).getTime()) / 86400000) + 1) : undefined;
      return { name: file.name, takenAt: capturedAt ? capturedAt.toLocaleString() : new Date(file.lastModified).toLocaleString(), note: '', latitude, longitude, timeSource: capturedAt ? 'exif' as const : 'fallback' as const, locationSource: latitude !== undefined && longitude !== undefined ? 'exif' as const : 'fallback' as const, archiveDay };
    }));
    setEntries(current => [...current, ...captured]);
  }

  return <section className="memory-note-card" aria-label="Photo journal capture">
    <div><span>PHOTO JOURNAL</span><b>Choose moments to keep.</b></div>
    <p className="drawer-copy">Files stay in this browser session for now. CocoCrunch does not upload photos or infer a story without a storage service and your consent.</p>
    <label className="secondary"><input type="file" accept="image/*" multiple hidden onChange={event => capture(event.target.files)}/>Choose photos</label>
    {entries.length > 0 && <><div className="reminder-list">{entries.map((entry, index) => <div key={`${entry.name}-${index}`}><div><b>{entry.name}</b><small>Captured {entry.takenAt} · {entry.timeSource === 'exif' ? 'EXIF timestamp' : 'Fallback file timestamp'}</small><small>{entry.locationSource === 'exif' ? `GPS EXIF: ${entry.latitude?.toFixed(4)}, ${entry.longitude?.toFixed(4)}` : 'Location not recognized — choose a place manually.'}</small>{(entry.timeSource === 'fallback' || entry.locationSource === 'fallback') && <><label>Day <input type="number" min="1" value={entry.archiveDay ?? ''} onChange={event => setEntries(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, archiveDay: Number(event.target.value) || undefined } : item))} /></label><label>Place <select value={entry.archivePlace ?? ''} onChange={event => setEntries(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, archivePlace: event.target.value || undefined } : item))}><option value="">Choose manually</option>{places.map(place => <option key={place}>{place}</option>)}</select></label></>}</div>{onSaveMoment && <button type="button" className="secondary" onClick={() => onSaveMoment({ ...entry, note }, audience)}>Pin to map &amp; Memory</button>}</div>)}</div>{groupMode && <fieldset className="photo-audience"><legend>Save this moment to</legend><label><input type="radio" checked={audience === 'personal'} onChange={() => setAudience('personal')} />My memory</label><label><input type="radio" checked={audience === 'group'} onChange={() => setAudience('group')} />Shared group album</label></fieldset>}<label className="setup-field"><span>One note for these moments</span><textarea value={note} onChange={event => setNote(event.target.value)} placeholder={`What stayed with you in ${destination}?`}/></label><button className="secondary" onClick={onIndex}>Index selected photos on Photo Map</button><small>EXIF is read locally in this browser. If time or location cannot be read, CocoCrunch asks you to choose rather than guessing; the old local prototype pin remains a fallback.</small></>}
  </section>;
}
