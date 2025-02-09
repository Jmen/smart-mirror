'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface WeatherData {
  temp: number;
  temp_min: number;
  temp_max: number;
  feels_like: number;
  description: string;
  icon: string;
}

interface ForecastData {
  date: string;
  temp: number;
  icon: string;
  description: string;
}

interface WeatherAPIResponse {
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    feels_like: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

interface ForecastAPIResponse {
  list: Array<{
    dt: number;
    dt_txt: string;
    main: {
      temp: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
  }>;
}

interface APIResponse {
  current: WeatherAPIResponse;
  forecast: ForecastAPIResponse;
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setError(null);
        const response = await fetch('/api/weather');
        const data: APIResponse = await response.json();
        
        if ('error' in data) {
          throw new Error(data.error as string);
        }

        const currentData = data.current;
        const forecastData = data.forecast;

        setWeather({
          temp: Math.round(currentData.main.temp),
          temp_min: Math.round(currentData.main.temp_min),
          temp_max: Math.round(currentData.main.temp_max),
          feels_like: Math.round(currentData.main.feels_like),
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
        });

        // Process forecast data
        const dailyForecasts = forecastData.list
          .filter((item: ForecastAPIResponse['list'][0]) => item.dt_txt.includes('12:00:00'))
          .slice(0, 5)
          .map((item) => ({
            date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(item.main.temp),
            icon: item.weather[0].icon,
            description: item.weather[0].description,
          }));

        setForecast(dailyForecasts);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setError(error instanceof Error ? error.message : 'Failed to load weather data');
        setWeather(null);
        setForecast([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather data every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading weather...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!weather) return <div>Unable to load weather</div>;

  return (
    <div className="flex flex-col items-start mt-4">
      {/* Current Weather */}
      <div className="flex flex-col items-start mb-6">
        <div className="flex items-start">
          <Image 
            src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            width={80}
            height={80}
            unoptimized
          />
          <div className="flex flex-col ml-2">
            <span className="text-3xl">Actual {weather.temp}°C</span>
            <span className="text-2xl text-gray-400">Feels Like {weather.feels_like}°</span>
            <div className="text-xl">
              <span className="text-red-400">{weather.temp_max}°</span>
              {' / '}
              <span className="text-blue-400">{weather.temp_min}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-day Forecast */}
      <div className="flex gap-4">
        {forecast.map((day) => (
          <div key={day.date} className="flex flex-col items-center">
            <div className="text-sm">{day.date}</div>
            <Image 
              src={`http://openweathermap.org/img/wn/${day.icon}.png`}
              alt={day.description}
              width={40}
              height={40}
              unoptimized
            />
            <div className="text-sm">{day.temp}°C</div>
          </div>
        ))}
      </div>
    </div>
  );
} 