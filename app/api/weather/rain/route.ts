import { NextResponse } from "next/server"
import { OPEN_METEO_BASE_URL, getCoordinates } from "@/lib/weather"

interface WeatherDataPoint {
  hour: string
  hour24: number
  chance: number
}

interface OpenMeteoHourlyResponse {
  hourly: {
    time: string[]
    precipitation_probability: number[]
  }
}

export async function GET() {
  try {
    const { lat, lon } = getCoordinates()

    const response = await fetch(
      `${OPEN_METEO_BASE_URL}/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability&forecast_hours=24&timezone=auto`
    )

    if (!response.ok) {
      throw new Error(`Open-Meteo API responded with status ${response.status}`)
    }

    const data = (await response.json()) as OpenMeteoHourlyResponse

    if (!data.hourly?.time || !data.hourly.precipitation_probability) {
      console.error("Unexpected API response format:", data)
      throw new Error("Invalid API response format")
    }

    // Sample every 3 hours — 8 points across the next 24 hours
    const hourlyData = data.hourly.time
      .map((time, i): WeatherDataPoint => {
        const date = new Date(time)
        return {
          hour: date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
          }),
          hour24: date.getHours(),
          chance: Math.round(data.hourly.precipitation_probability[i])
        }
      })
      .filter((_, i) => i % 3 === 0)
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
