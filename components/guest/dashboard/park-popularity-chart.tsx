"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "Mon", visits: 400 },
  { name: "Tue", visits: 300 },
  { name: "Wed", visits: 500 },
  { name: "Thu", visits: 280 },
  { name: "Fri", visits: 590 },
  { name: "Sat", visits: 800 },
  { name: "Sun", visits: 700 },
]

export function ParkPopularityChart() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Park Popularity (Last Week)</CardTitle>
      </CardHeader>
      <CardContent className="w-full aspect-[2/1]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar dataKey="visits" fill="#adfa1d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

