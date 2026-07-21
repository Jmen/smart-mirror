import { NextResponse } from 'next/server';
import { OPEN_METEO_BASE_URL, getCoordinates, wmoToCondition } from '@/lib/weather';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weathercode: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export async function GET() {
  try {
    const { lat, lon } = getCoordinates();

    const response = await fetch(
      `${OPEN_METEO_BASE_URL}/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&forecast_days=8&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(`Open-Meteo API responded with status ${response.status}`);
    }

    const data = (await response.json()) as OpenMeteoResponse;

    if (!data.current || !data.daily?.time || data.daily.time.length < 8) {
      throw new Error('Invalid data received from Open-Meteo API');
    }

    const current = {
      temp: Math.round(data.current.temperature_2m),
      temp_min: Math.round(data.daily.temperature_2m_min[0]),
      temp_max: Math.round(data.daily.temperature_2m_max[0]),
      feels_like: Math.round(data.current.apparent_temperature),
      ...wmoToCondition(data.current.weathercode, data.current.is_day === 1),
    };

    // Days 1-7: the week ahead; today's conditions are shown separately
    const daily = data.daily.time.slice(1).map((date, i) => ({
      date,
      temp: Math.round(data.daily.temperature_2m_max[i + 1]),
      ...wmoToCondition(data.daily.weathercode[i + 1]),
    }));

    return NextResponse.json({ current, daily });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
