import { useState } from 'react';

export type PhotoJournalEntry = { name: string; takenAt: string; note: string };

export function PhotoJournalCapture({ destination, onIndex, groupMode = false, onSaveMoment }: { destination: string; onIndex: () => void; groupMode?: boolean; onSaveMoment?: (entry: PhotoJournalEntry, audience: 'personal' | 'group') => void }) {
  const [entries, setEntries] = useState<PhotoJournalEntry[]>([]);
  const [note, setNote] = useState('');
  const [audience, setAudience] = useState<'personal' | 'group'>('personal');

  function capture(files: FileList | null) {
    if (!files?.length) return;
    const captured = Array.from(files).map(file => ({ name: file.name, takenAt: new Date(file.lastModified).toLocaleString(), note: '' }));
    setEntries(current => [...current, ...captured]);
  }

  return <section className="memory-note-card" aria-label="Photo journal capture">
    <div><span>PHOTO JOURNAL</span><b>Choose moments to keep.</b></div>
    <p className="drawer-copy">Files stay in this browser session for now. CocoCrunch does not upload photos or infer a story without a storage service and your consent.</p>
    <label className="secondary"><input type="file" accept="image/*" multiple hidden onChange={event => capture(event.target.files)}/>Choose photos</label>
    {entries.length > 0 && <><div className="reminder-list">{entries.map((entry, index) => <div key={`${entry.name}-${index}`}><div><b>{entry.name}</b><small>Captured {entry.takenAt}</small></div>{onSaveMoment && <button type="button" className="secondary" onClick={() => onSaveMoment({ ...entry, note }, audience)}>Pin to map &amp; Memory</button>}</div>)}</div>{groupMode && <fieldset className="photo-audience"><legend>Save this moment to</legend><label><input type="radio" checked={audience === 'personal'} onChange={() => setAudience('personal')} />My memory</label><label><input type="radio" checked={audience === 'group'} onChange={() => setAudience('group')} />Shared group album</label></fieldset>}<label className="setup-field"><span>One note for these moments</span><textarea value={note} onChange={event => setNote(event.target.value)} placeholder={`What stayed with you in ${destination}?`}/></label><button className="secondary" onClick={onIndex}>Index selected photos on Photo Map</button><small>Location and time are prototype metadata derived locally from the selected file. Files are not uploaded.</small></>}
  </section>;
}
