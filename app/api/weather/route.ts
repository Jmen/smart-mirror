import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.LATITUDE}&lon=${process.env.LONGITUDE}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${process.env.LATITUDE}&lon=${process.env.LONGITUDE}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      )
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Weather API returned an error');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // Validate the response data
    if (!currentData.main || !currentData.weather || !forecastData.list) {
      throw new Error('Invalid data received from Weather API');
    }

    return NextResponse.json({ current: currentData, forecast: forecastData });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
} 