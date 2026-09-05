import { describe, expect, it, vi } from 'vitest';
import { fetchWeatherSnapshot, weatherLabel } from './weather';

describe('weather adapter', () => {
  it('maps provider codes without inventing unavailable detail', () => {
    expect(weatherLabel(0)).toBe('Clear');
    expect(weatherLabel(61)).toBe('Rain nearby');
    expect(weatherLabel(95)).toBe('Storm risk');
  });

  it('normalizes geocoding and current weather into a snapshot', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ latitude: 3.14, longitude: 101.7, name: 'Kuala Lumpur' }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ current: { temperature_2m: 29, weather_code: 1, time: '2026-09-05T19:00' } }), { status: 200 }));
    await expect(fetchWeatherSnapshot('Kuala Lumpur')).resolves.toEqual({ destination: 'Kuala Lumpur', temperatureC: 29, weatherCode: 1, observedAt: '2026-09-05T19:00', source: 'open-meteo' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockRestore();
  });
});
