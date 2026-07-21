// Shared helpers for the Open-Meteo weather API (https://open-meteo.com)
// Free for non-commercial use, no API key required.

export const OPEN_METEO_BASE_URL =
  process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com';

export function getCoordinates() {
  return {
    lat: process.env.LATITUDE || '51.5074',
    lon: process.env.LONGITUDE || '-0.1278',
  };
}

export interface WeatherCondition {
  icon: string;
  description: string;
}

// Map WMO weather codes to OpenWeather icon codes — the icon set the
// mirror renders from openweathermap.org/img/wn/
const WMO_CODES: Record<number, WeatherCondition> = {
  0: { icon: '01d', description: 'clear sky' },
  1: { icon: '02d', description: 'mainly clear' },
  2: { icon: '03d', description: 'partly cloudy' },
  3: { icon: '04d', description: 'overcast clouds' },
  45: { icon: '50d', description: 'fog' },
  48: { icon: '50d', description: 'rime fog' },
  51: { icon: '09d', description: 'light drizzle' },
  53: { icon: '09d', description: 'drizzle' },
  55: { icon: '09d', description: 'heavy drizzle' },
  56: { icon: '09d', description: 'freezing drizzle' },
  57: { icon: '09d', description: 'freezing drizzle' },
  61: { icon: '10d', description: 'light rain' },
  63: { icon: '10d', description: 'rain' },
  65: { icon: '10d', description: 'heavy rain' },
  66: { icon: '10d', description: 'freezing rain' },
  67: { icon: '10d', description: 'freezing rain' },
  71: { icon: '13d', description: 'light snow' },
  73: { icon: '13d', description: 'snow' },
  75: { icon: '13d', description: 'heavy snow' },
  77: { icon: '13d', description: 'snow grains' },
  80: { icon: '09d', description: 'light showers' },
  81: { icon: '09d', description: 'showers' },
  82: { icon: '09d', description: 'heavy showers' },
  85: { icon: '13d', description: 'snow showers' },
  86: { icon: '13d', description: 'snow showers' },
  95: { icon: '11d', description: 'thunderstorm' },
  96: { icon: '11d', description: 'thunderstorm with hail' },
  99: { icon: '11d', description: 'thunderstorm with hail' },
};

export function wmoToCondition(code: number, isDay = true): WeatherCondition {
  const condition = WMO_CODES[code] ?? { icon: '03d', description: 'unknown' };
  return isDay
    ? condition
    : { ...condition, icon: condition.icon.replace('d', 'n') };
}
