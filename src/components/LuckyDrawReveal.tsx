type LuckyDrawRevealProps = {
  result?: string;
  onDraw: () => void;
};

export function LuckyDrawReveal({ result, onDraw }: LuckyDrawRevealProps) {
  return (
    <section className="lucky-draw-reveal" aria-labelledby="lucky-draw-title">
      <header className="lucky-draw-reveal__header">
        <span>LUCKY DRAW · ENTERTAINMENT</span>
        <h3 id="lucky-draw-title">Open a tiny fortune for the mood.</h3>
      </header>
      <div className="lucky-draw-reveal__note" aria-hidden="true">
        <span>SEALED NOTE</span>
        <b>For your eyes only</b>
      </div>
      <p>Entertainment only: draw a sealed note for a small moment of surprise. It stays separate from real decisions and profile data.</p>
      <button className="lucky-draw-reveal__button" type="button" onClick={onDraw}>
        {result ? 'Draw again' : 'Draw a fortune'}
      </button>
      {result && (
        <div className="lucky-draw-reveal__result">
          <span>FORTUNE REVEAL</span>
          <b>{result}</b>
        </div>
      )}
    </section>
  );
}
