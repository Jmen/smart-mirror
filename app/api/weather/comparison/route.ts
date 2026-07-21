import { NextResponse } from "next/server"

interface OpenMeteoResponse {
  current: {
    temperature_2m: number
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

export async function GET() {
  try {
    const lat = process.env.LATITUDE || "51.5074"
    const lon = process.env.LONGITUDE || "-0.1278"

    // Open-Meteo is free and needs no API key; past_days=1 + forecast_days=1
    // returns daily entries for [yesterday, today]
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&current=temperature_2m&past_days=1&forecast_days=1&timezone=auto`
    )

    if (!response.ok) {
      throw new Error(`Open-Meteo API responded with status ${response.status}`)
    }

    const data = (await response.json()) as OpenMeteoResponse

    if (
      !data.daily ||
      data.daily.temperature_2m_max?.length < 2 ||
      data.daily.temperature_2m_min?.length < 2
    ) {
      console.error("Unexpected API response format:", data)
      throw new Error("Invalid API response format")
    }

    return NextResponse.json({
      yesterday: {
        min: Math.round(data.daily.temperature_2m_min[0]),
        max: Math.round(data.daily.temperature_2m_max[0]),
      },
      today: {
        min: Math.round(data.daily.temperature_2m_min[1]),
        max: Math.round(data.daily.temperature_2m_max[1]),
      },
      current: Math.round(data.current.temperature_2m),
    })
  } catch (error) {
    console.error("Error fetching temperature comparison:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch temperature comparison" },
      { status: 500 }
    )
  }
}
