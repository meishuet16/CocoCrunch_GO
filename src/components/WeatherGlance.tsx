import { useEffect, useState } from 'react';
import { fetchWeatherSnapshot, type WeatherState, weatherLabel } from '../weather';

export function WeatherGlance({ destination, compact = false }: { destination: string; compact?: boolean }) {
  const [state, setState] = useState<WeatherState>({ status: 'idle' });
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetchWeatherSnapshot(destination, controller.signal)
      .then(snapshot => setState({ status: 'ready', snapshot }))
      .catch(error => { if (!controller.signal.aborted) setState({ status: 'unavailable', message: error instanceof Error ? error.message : 'Weather unavailable.' }); });
    return () => controller.abort();
  }, [destination]);
  if (state.status === 'loading' || state.status === 'idle') return <section className={`weather-glance ${compact ? 'compact' : ''}`} aria-label="Weather"><span>WEATHER</span><b>Checking provider…</b><small>Open-Meteo · no itinerary changes are automatic</small></section>;
  if (state.status === 'unavailable' || !state.snapshot) return <section className={`weather-glance ${compact ? 'compact' : ''}`} aria-label="Weather"><span>WEATHER</span><b>Unavailable right now</b><small>{state.message ?? 'No provider snapshot returned.'} Plan data is unchanged.</small></section>;
  const { snapshot } = state;
  return <section className={`weather-glance ${compact ? 'compact' : ''}`} aria-label="Weather"><span>WEATHER · {snapshot.destination}</span><b>{Math.round(snapshot.temperatureC)}°C · {weatherLabel(snapshot.weatherCode)}</b><small>Observed {snapshot.observedAt.replace('T', ' ')} · Open-Meteo</small></section>;
}
