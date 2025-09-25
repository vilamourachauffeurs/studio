"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", bookings: 186, revenue: 8000 },
  { month: "February", bookings: 305, revenue: 9500 },
  { month: "March", bookings: 237, revenue: 7000 },
  { month: "April", bookings: 273, revenue: 11000 },
  { month: "May", bookings: 209, revenue: 9800 },
  { month: "June", bookings: 214, revenue: 12000 },
]

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent))",
  },
}

export function BookingsChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-80">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
