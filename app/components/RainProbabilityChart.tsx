"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { ChartContainer } from "@/app/components/ui/chart"

interface RainData {
  hour: string
  chance: number
}

export default function RainProbabilityChart() {
  const [rainData, setRainData] = useState<RainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const fetchRainData = async () => {
      try {
        setError(null)
        const response = await fetch('/api/weather/rain')
        
        if (response.status === 503) {
          setEnabled(false)
          return
        }
        
        const data = await response.json()

        if ('error' in data) {
          throw new Error(data.error)
        }

        setRainData(data)
      } catch (error) {
        console.error('Error fetching rain data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load rain data')
      } finally {
        setLoading(false)
      }
    }

    if (enabled) {
      fetchRainData()
      // Refresh every 5 minutes
      const interval = setInterval(fetchRainData, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [enabled])

  if (!enabled) return null
  if (loading) return null
  if (error) return null
  if (rainData.length === 0) return null

  return (
    <div className="flex flex-col items-start mt-6">
      <ChartContainer
        config={{
          rainChance: {
            label: "Chance of Rain",
            color: "rgb(59, 130, 246)", // Tailwind's blue-500
          },
        }}
        className="w-[350px]"
      >
        <h2 className="mb-4 text-lg font-semibold">Chance of Rain</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            accessibilityLayer
            data={rainData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 50,
            }}
          >
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              tickMargin={20}
              tick={{ fontSize: 14, fill: "white" }}
              height={60}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: "white" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Bar
              dataKey="chance"
              fill="rgb(59, 130, 246)" // Tailwind's blue-500
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

