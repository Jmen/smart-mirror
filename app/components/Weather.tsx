'use client';

import { useState, useEffect } from 'react';

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

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [currentResponse, forecastResponse] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${process.env.NEXT_PUBLIC_LATITUDE}&lon=${process.env.NEXT_PUBLIC_LONGITUDE}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${process.env.NEXT_PUBLIC_LATITUDE}&lon=${process.env.NEXT_PUBLIC_LONGITUDE}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
          )
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Filter forecast items for today to get min/max
        const todayForecasts = forecastData.list.filter((item: any) => 
          item.dt_txt.startsWith(today)
        );

        const todayTemps = todayForecasts.map((item: any) => item.main.temp);
        const temp_min = Math.round(Math.min(...todayTemps));
        const temp_max = Math.round(Math.max(...todayTemps));
        
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
          // Group by day and take the middle of the day reading (noon)
          .filter((item: any) => item.dt_txt.includes('12:00:00'))
          .slice(0, 5)
          .map((item: any) => ({
            date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(item.main.temp),
            icon: item.weather[0].icon,
            description: item.weather[0].description,
          }));

        setForecast(dailyForecasts);
      } catch (error) {
        console.error('Error fetching weather:', error);
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
  if (!weather) return <div>Unable to load weather</div>;

  return (
    <div className="flex flex-col items-start mt-4">
      {/* Current Weather */}
      <div className="flex flex-col items-start mb-6">
        <div className="flex items-start">
          <img 
            src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            width={80}
            height={80}
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
            <img 
              src={`http://openweathermap.org/img/wn/${day.icon}.png`}
              alt={day.description}
              width={40}
              height={40}
            />
            <div className="text-sm">{day.temp}°C</div>
          </div>
        ))}
      </div>
    </div>
  );
} 