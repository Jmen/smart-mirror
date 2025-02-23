import { NextResponse } from "next/server"

interface WeatherDataPoint {
  hour: string
  hour24: number
  chance: number
}

interface OpenWeatherForecastItem {
  dt: number
  pop: number
  // Add other fields if needed
}

interface OpenWeatherResponse {
  list: OpenWeatherForecastItem[]
}

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenWeather API key not configured" },
      { status: 503 }
    )
  }

  try {
    const lat = process.env.WEATHER_LAT || "51.5074"
    const lon = process.env.WEATHER_LON || "-0.1278"
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error(`OpenWeather API responded with status ${response.status}`)
    }

    const data = (await response.json()) as OpenWeatherResponse
    
    if (!data.list || !Array.isArray(data.list)) {
      console.error("Unexpected API response format:", data)
      throw new Error("Invalid API response format")
    }

    // Process next 8 3-hour intervals
    const hourlyData = data.list.slice(0, 8).map((item: OpenWeatherForecastItem) => {
      if (!item.dt || typeof item.pop === 'undefined') {
        console.error("Invalid item format:", item)
        throw new Error("Invalid item data")
      }

      const date = new Date(item.dt * 1000)
      return {
        hour: date.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          hour12: true 
        }),
        hour24: date.getHours(),
        chance: Math.round(item.pop * 100)
      }
    })
    .sort((a: WeatherDataPoint, b: WeatherDataPoint) => {
      // Adjust hours to start from 6 AM
      const adjustHour = (hour24: number) => (hour24 + 24 - 6) % 24
      return adjustHour(a.hour24) - adjustHour(b.hour24)
    })
    .map(({ hour, chance }) => ({ hour, chance }))

    if (hourlyData.length === 0) {
      throw new Error("No valid data points found")
    }

    return NextResponse.json(hourlyData)
  } catch (error) {
    console.error("Error fetching rain probability:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch rain probability data" },
      { status: 500 }
    )
  }
} 