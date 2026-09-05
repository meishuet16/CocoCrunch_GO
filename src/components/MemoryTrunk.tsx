import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useRitualSequence } from '../motion/useRitualSequence';
import { CocoCompanion } from './coco/CocoCompanion';
import './memory-trunk.css';

export type MemoryArtifact = { id: string; title: string; body: string; source: string };
export type MemoryTrunkProps = {
  artifacts: MemoryArtifact[];
  available: boolean;
  /** Change this token to request opening. Tokens received while gated are not replayed. */
  openRequested?: number;
};

const lidStages = [
  { name: 'opening', durationMs: 640 },
  { name: 'revealing', durationMs: 680 },
  { name: 'settling', durationMs: 240 },
  { name: 'browse' },
  { name: 'closing', durationMs: 600 },
  { name: 'closed' },
] as const;
const paperStages = [
  { name: 'lifting', durationMs: 440 },
  { name: 'inspect' },
  { name: 'returning', durationMs: 400 },
  { name: 'returned' },
] as const;

/** The gate removes the entire stateful ritual, including timers and selected data. */
export function MemoryTrunk(props: MemoryTrunkProps) {
  if (!props.available) return (
    <section className="memory-trunk" data-stage="closed" aria-label="Memory trunk">
      <div className="memory-trunk__case memory-trunk__case--locked" aria-hidden="true">
        <div className="memory-trunk__lid"><span>MEMORIES</span></div>
      </div>
      <p>Confirm or dismiss the proposed learning before opening your memories.</p>
      <button type="button" disabled>Open memory trunk</button>
    </section>
  );
  return <AvailableMemoryTrunk {...props} />;
}

function AvailableMemoryTrunk({ artifacts, openRequested }: MemoryTrunkProps) {
  const lid = useRitualSequence(lidStages);
  const paper = useRitualSequence(paperStages);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const request = useRef(openRequested);
  const opener = useRef<HTMLButtonElement>(null);
  const browseControl = useRef<HTMLButtonElement>(null);
  const reader = useRef<HTMLElement>(null);
  const origin = useRef<HTMLButtonElement | null>(null);
  const stage = lid.stage ?? 'closed';
  const selected = artifacts.find(artifact => artifact.id === selectedId);
  const takingOut = !!selected && paper.stage !== null && paper.stage !== 'returned';
  const contentsVisible = ['revealing', 'settling', 'browse'].includes(stage);
  const canBrowse = stage === 'browse' && !takingOut;
  const decorativeBusy = (lid.busy && stage !== 'browse') || (paper.busy && paper.stage !== 'inspect');

  function open() {
    if (stage !== 'closed') return;
    paper.reset(); setSelectedId(null); lid.start();
  }
  useEffect(() => {
    if (request.current === openRequested) return;
    request.current = openRequested;
    if (openRequested !== undefined) open();
  }, [openRequested]);
  useEffect(() => {
    if (stage === 'browse') browseControl.current?.focus();
    if (stage === 'closed') opener.current?.focus();
  }, [stage]);
  useEffect(() => {
    if (paper.stage === 'inspect') reader.current?.focus();
    if (paper.stage === 'returned') {
      setSelectedId(null);
      if (origin.current?.isConnected) origin.current.focus();
      else browseControl.current?.focus();
    }
  }, [paper.stage]);
  useEffect(() => {
    if (selectedId !== null && !selected) {
      paper.reset(); setSelectedId(null); browseControl.current?.focus();
    }
  }, [selectedId, selected]);

  return (
    <section className="memory-trunk" aria-label="Memory trunk" data-stage={stage}
      data-selection={takingOut ? paper.stage : 'stack'} data-reduced-motion={lid.reducedMotion}
      onKeyDown={event => {
        if (event.key !== 'Escape') return;
        if (takingOut && paper.stage === 'inspect') { event.preventDefault(); paper.advance(); }
        else if (canBrowse) { event.preventDefault(); lid.advance(); }
      }}>
      <header className="memory-trunk__heading">
        <div><p className="memory-trunk__eyebrow">YOUR TRIP, KEPT CLOSE</p><h2>Memory trunk</h2></div>
        <CocoCompanion context={artifacts.length ? 'memory' : 'empty'} size={88} />
      </header>
      <div className="memory-trunk__scene">
        <div className="memory-trunk__case">
          <div className="memory-trunk__lining" aria-hidden="true" />
          <div className="memory-trunk__lid" aria-hidden="true"><span>MEMORIES</span></div>
          <div className="memory-trunk__hinges" aria-hidden="true" />
          <div className="memory-trunk__handle" aria-hidden="true" />
          {contentsVisible && <div className="memory-trunk__contents">
            {artifacts.length === 0 ? <p className="memory-trunk__empty">Nothing packed here yet.</p> :
              <div className="memory-trunk__papers" aria-label="Packed memories">
                {artifacts.map((artifact, index) => (
                  <button type="button" key={artifact.id} className="memory-trunk__paper"
                    data-away={takingOut && selectedId === artifact.id}
                    style={{ '--paper-turn': `${(index % 5 - 2) * 2}deg`, '--paper-delay': `${Math.min(index, 6) * 65}ms` } as CSSProperties}
                    aria-label={`Read ${artifact.title}`} disabled={!canBrowse}
                    onClick={event => {
                      if (!canBrowse || paper.busy) return;
                      origin.current = event.currentTarget;
                      setSelectedId(artifact.id); paper.start();
                    }}>
                    <span className="memory-trunk__paper-title">{artifact.title}</span>
                    <span className="memory-trunk__paper-source">{artifact.source}</span>
                  </button>
                ))}
              </div>}
          </div>}
        </div>
        {takingOut && contentsVisible && <article className="memory-trunk__reading" ref={reader} tabIndex={-1}
          aria-label={selected.title}>
          <h3>{selected.title}</h3>
          <p className="memory-trunk__provenance">{selected.source}</p>
          <div className="memory-trunk__body">{selected.body}</div>
          <button type="button" disabled={paper.stage !== 'inspect'} onClick={() => {
            if (paper.stage === 'inspect') paper.advance();
          }}>Return to trunk</button>
        </article>}
      </div>
      <div className="memory-trunk__controls">
        {stage === 'closed' ? <button type="button" ref={opener} onClick={open}>Open memory trunk</button> :
          <button type="button" ref={browseControl} disabled={!canBrowse} onClick={() => {
            if (canBrowse) lid.advance();
          }}>Close memory trunk</button>}
        <p role="status">{decorativeBusy ? ({ opening: 'Opening the lid…', revealing: 'Unpacking your memories…', settling: 'Letting the papers settle…', closing: 'Closing the lid…', browse: 'Moving the paper…', closed: '' }[stage])
          : takingOut ? 'Return this memory when you are ready.'
            : canBrowse && artifacts.length ? 'Lift a paper to read it.' : ''}</p>
      </div>
    </section>
  );
}
