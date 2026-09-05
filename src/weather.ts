export type WeatherSnapshot = {
  destination: string;
  temperatureC: number;
  weatherCode: number;
  observedAt: string;
  source: 'open-meteo';
};

export type WeatherState = { status: 'idle' | 'loading' | 'ready' | 'unavailable'; snapshot?: WeatherSnapshot; message?: string };

const geocodeUrl = (destination: string) => `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;

export async function fetchWeatherSnapshot(destination: string, signal?: AbortSignal): Promise<WeatherSnapshot> {
  const geocodeResponse = await fetch(geocodeUrl(destination), { signal });
  if (!geocodeResponse.ok) throw new Error(`Weather location lookup failed (${geocodeResponse.status}).`);
  const geocode = await geocodeResponse.json() as { results?: { latitude: number; longitude: number; name: string }[] };
  const location = geocode.results?.[0];
  if (!location) throw new Error('This destination is not available from the weather provider.');
  const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&timezone=auto`, { signal });
  if (!forecastResponse.ok) throw new Error(`Weather forecast failed (${forecastResponse.status}).`);
  const forecast = await forecastResponse.json() as { current?: { temperature_2m: number; weather_code: number; time: string } };
  if (!forecast.current) throw new Error('The weather provider returned no current snapshot.');
  return { destination: location.name, temperatureC: forecast.current.temperature_2m, weatherCode: forecast.current.weather_code, observedAt: forecast.current.time, source: 'open-meteo' };
}

export function weatherLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'Rain nearby';
  if (code <= 77) return 'Wintry';
  if (code >= 95) return 'Storm risk';
  return 'Changing conditions';
}
