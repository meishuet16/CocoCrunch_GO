import type { TripPhase } from './TripWorkspace';
import { WeatherGlance } from './WeatherGlance';

type Dates = { start: string; end: string } | null;

const phaseCopy: Record<TripPhase, string> = {
  planning: 'Before · shaping the trip',
  traveling: 'During · stay with today',
  completed: 'After · keep what mattered',
};

export function HomeTripGlance({ destination, dates, phase }: { destination: string; dates: Dates; phase: TripPhase }) {
  return <section className="home-trip-glance paper-sheet" aria-label="Trip context">
    <div className="home-trip-context"><span>TRIP</span><b>{destination}</b><small>{dates ? `${dates.start}–${dates.end}` : 'Dates to be confirmed'}</small></div>
    <div className="home-trip-phase"><span>STATUS</span><b>{phaseCopy[phase]}</b></div>
    <WeatherGlance destination={destination} compact/>
  </section>;
}
