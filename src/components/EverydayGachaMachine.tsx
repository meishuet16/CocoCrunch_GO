type EverydayGachaMachineProps = {
  result?: string;
  onTurn: () => void;
};

export function EverydayGachaMachine({ result, onTurn }: EverydayGachaMachineProps) {
  return (
    <section className="everyday-gacha-machine" aria-labelledby="everyday-gacha-title">
      <header className="everyday-gacha-machine__header">
        <span>GACHA · EVERYDAY INDECISION</span>
        <h3 id="everyday-gacha-title">Choose a small everyday move.</h3>
      </header>
      <div className="everyday-gacha-machine__stage" aria-hidden="true">
        <div className="everyday-gacha-machine__capsule"><i /></div>
        <span>capsule machine</span>
      </div>
      <p>Turn between reasonable everyday options when the next little choice feels too close to call.</p>
      <div className="everyday-gacha-machine__options" aria-label="Everyday options">
        <span>Café route</span>
        <i aria-hidden="true" />
        <span>Riverside route</span>
      </div>
      <p className="everyday-gacha-machine__boundary">This is not a Court decision. It does not write the official itinerary or learning.</p>
      <button className="gacha-machine everyday-gacha-machine__button" type="button" onClick={onTurn}>
        {result ? 'Turn again' : 'Turn the Gacha'}
      </button>
      {result && (
        <div className="everyday-gacha-machine__result">
          <span>EVERYDAY RESULT</span>
          <b>{result}</b>
        </div>
      )}
    </section>
  );
}
