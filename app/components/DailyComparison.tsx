"use client"

import { useState, useEffect } from "react"

interface DayTemps {
  min: number
  max: number
}

interface ComparisonData {
  yesterday: DayTemps
  today: DayTemps
  current: number
}

// Apple Weather-style temperature colour scale (°C)
const COLOR_STOPS: Array<[number, [number, number, number]]> = [
  [-10, [108, 127, 216]], // indigo
  [0, [99, 168, 232]], // blue
  [10, [99, 198, 183]], // teal
  [15, [163, 209, 122]], // green
  [20, [217, 211, 86]], // yellow
  [25, [240, 160, 60]], // orange
  [35, [224, 91, 61]], // red-orange
]

function tempToColor(temp: number): string {
  const first = COLOR_STOPS[0]
  const last = COLOR_STOPS[COLOR_STOPS.length - 1]
  if (temp <= first[0]) return `rgb(${first[1].join(",")})`
  if (temp >= last[0]) return `rgb(${last[1].join(",")})`

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [t0, c0] = COLOR_STOPS[i]
    const [t1, c1] = COLOR_STOPS[i + 1]
    if (temp >= t0 && temp <= t1) {
      const f = (temp - t0) / (t1 - t0)
      const rgb = c0.map((c, j) => Math.round(c + (c1[j] - c) * f))
      return `rgb(${rgb.join(",")})`
    }
  }
  return `rgb(${last[1].join(",")})`
}

function summaryText(today: DayTemps, yesterday: DayTemps): string {
  const diff = today.max - yesterday.max
  if (diff >= 2) return "The high temperature today is warmer than yesterday."
  if (diff <= -2) return "The high temperature today is cooler than yesterday."
  return "The high temperature today is similar to yesterday."
}

interface TempBarProps {
  label: string
  temps: DayTemps
  scaleMin: number
  scaleMax: number
  current?: number
}

function TempBar({ label, temps, scaleMin, scaleMax, current }: TempBarProps) {
  const range = scaleMax - scaleMin || 1
  const left = ((temps.min - scaleMin) / range) * 100
  const width = ((temps.max - temps.min) / range) * 100
  const gradient = `linear-gradient(to right, ${tempToColor(temps.min)}, ${tempToColor(
    (temps.min + temps.max) / 2
  )}, ${tempToColor(temps.max)})`

  const showDot = current !== undefined && current >= temps.min && current <= temps.max
  const dotLeft = showDot ? ((current - scaleMin) / range) * 100 : 0

  return (
    <div className="flex items-center gap-4 w-full">
      <span className="text-xl w-28">{label}</span>
      <span className="text-xl text-gray-400 w-10 text-right">{temps.min}°</span>
      <div className="relative flex-1 h-1.5 rounded-full bg-neutral-700">
        <div
          className="absolute h-full rounded-full"
          style={{ left: `${left}%`, width: `${width}%`, background: gradient }}
        />
        {showDot && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-neutral-900"
            style={{ left: `${dotLeft}%` }}
          />
        )}
      </div>
      <span className="text-xl w-10 text-right">{temps.max}°</span>
    </div>
  )
}

export default function DailyComparison() {
  const [data, setData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setError(null)
        const response = await fetch('/api/weather/comparison')
        const json = await response.json()

        if ('error' in json) {
          throw new Error(json.error)
        }

        setData(json)
      } catch (error) {
        console.error('Error fetching temperature comparison:', error)
        setError(error instanceof Error ? error.message : 'Failed to load comparison data')
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
    // Refresh every 5 minutes
    const interval = setInterval(fetchComparison, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || error || !data) return null

  const scaleMin = Math.min(data.today.min, data.yesterday.min)
  const scaleMax = Math.max(data.today.max, data.yesterday.max)

  return (
    <div className="flex flex-col items-start mt-6 w-[420px]">
      <h2 className="mb-4 text-lg font-semibold">Daily Comparison</h2>
      <div className="w-full rounded-2xl bg-neutral-800/60">
        <p className="px-5 py-4 text-lg text-gray-200 border-b border-neutral-700">
          {summaryText(data.today, data.yesterday)}
        </p>
        <div className="flex flex-col gap-5 px-5 py-5">
          <TempBar
            label="Today"
            temps={data.today}
            scaleMin={scaleMin}
            scaleMax={scaleMax}
            current={data.current}
          />
          <TempBar
            label="Yesterday"
            temps={data.yesterday}
            scaleMin={scaleMin}
            scaleMax={scaleMax}
          />
        </div>
      </div>
    </div>
  )
}
