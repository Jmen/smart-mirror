"use client"

import * as React from "react"

interface ChartConfig {
  label: string
  color: string
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, ChartConfig>
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  (props, ref) => <div ref={ref} {...props} />
)
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
))
ChartTooltip.displayName = "ChartTooltip"

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`rounded-lg border bg-background p-2 shadow-md ${className}`} {...props} />
  ),
)
ChartTooltipContent.displayName = "ChartTooltipContent"

