import { NextResponse } from 'next/server';

interface DailyForecast {
  date: string;
  temp: number;
  icon: string;
  description: string;
}

interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
  };
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt_txt: string;
    main: { temp: number };
    weather: Array<{ description: string; icon: string }>;
  }>;
}

// Map WMO weather codes (Open-Meteo) to OpenWeather icon codes so the
// forecast strip keeps using the same icon set as the current conditions
const WMO_CODES: Record<number, { icon: string; description: string }> = {
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

// Open-Meteo covers 7 days for free; OpenWeather's free forecast only 5
async function fetchOpenMeteoDaily(lat: string, lon: string): Promise<DailyForecast[]> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max&forecast_days=8&timezone=auto`
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo API responded with status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoDailyResponse;

  if (!data.daily?.time || !data.daily.weathercode || !data.daily.temperature_2m_max) {
    throw new Error('Invalid data received from Open-Meteo API');
  }

  // Drop today (index 0) — current conditions are shown separately
  return data.daily.time.slice(1, 8).map((date, i) => {
    const code = WMO_CODES[data.daily.weathercode[i + 1]] ?? {
      icon: '03d',
      description: 'unknown',
    };
    return {
      date,
      temp: Math.round(data.daily.temperature_2m_max[i + 1]),
      icon: code.icon,
      description: code.description,
    };
  });
}

async function fetchOpenWeatherDaily(lat: string, lon: string): Promise<DailyForecast[]> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error(`OpenWeather forecast API responded with status ${response.status}`);
  }

  const data = (await response.json()) as OpenWeatherForecastResponse;

  if (!data.list) {
    throw new Error('Invalid data received from OpenWeather forecast API');
  }

  return data.list
    .filter((item) => item.dt_txt.includes('12:00:00'))
    .slice(0, 7)
    .map((item) => ({
      date: item.dt_txt.split(' ')[0],
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon,
      description: item.weather[0].description,
    }));
}

export async function GET() {
  try {
    const lat = process.env.LATITUDE || '51.5074';
    const lon = process.env.LONGITUDE || '-0.1278';

    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    if (!currentResponse.ok) {
      throw new Error('Weather API returned an error');
    }

    const currentData = await currentResponse.json();

    if (!currentData.main || !currentData.weather) {
      throw new Error('Invalid data received from Weather API');
    }

    let daily: DailyForecast[];
    try {
      daily = await fetchOpenMeteoDaily(lat, lon);
    } catch (error) {
      console.error('Open-Meteo daily forecast failed, falling back to OpenWeather 5-day:', error);
      daily = await fetchOpenWeatherDaily(lat, lon);
    }

    return NextResponse.json({ current: currentData, daily });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
