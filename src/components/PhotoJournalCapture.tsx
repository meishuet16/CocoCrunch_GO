import { useState } from 'react';

export type PhotoJournalEntry = { name: string; takenAt: string; note: string };

export function PhotoJournalCapture({ destination, onIndex }: { destination: string; onIndex: () => void }) {
  const [entries, setEntries] = useState<PhotoJournalEntry[]>([]);
  const [note, setNote] = useState('');

  function capture(files: FileList | null) {
    if (!files?.length) return;
    const captured = Array.from(files).map(file => ({ name: file.name, takenAt: new Date(file.lastModified).toLocaleString(), note: '' }));
    setEntries(current => [...current, ...captured]);
  }

  return <section className="memory-note-card" aria-label="Photo journal capture">
    <div><span>PHOTO JOURNAL</span><b>Choose moments to keep.</b></div>
    <p className="drawer-copy">Files stay in this browser session for now. CocoCrunch does not upload photos or infer a story without a storage service and your consent.</p>
    <label className="secondary"><input type="file" accept="image/*" multiple hidden onChange={event => capture(event.target.files)}/>Choose photos</label>
    {entries.length > 0 && <><div className="reminder-list">{entries.map((entry, index) => <div key={`${entry.name}-${index}`}><div><b>{entry.name}</b><small>Captured {entry.takenAt}</small></div></div>)}</div><label className="setup-field"><span>One note for these moments</span><textarea value={note} onChange={event => setNote(event.target.value)} placeholder={`What stayed with you in ${destination}?`}/></label><button className="secondary" onClick={onIndex}>Index selected photos on Photo Map</button></>}
  </section>;
}
