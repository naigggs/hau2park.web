import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Sun, CloudRain } from "lucide-react"

const weatherForecast = [
  { park: "Sunshine Park", condition: "Sunny", icon: Sun },
  { park: "Greenwood Gardens", condition: "Cloudy", icon: Cloud },
  { park: "Riverside Walk", condition: "Rainy", icon: CloudRain },
]

export function WeatherForecast() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Weather Forecast</CardTitle>
        <Cloud className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {weatherForecast.map((forecast, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span>{forecast.park}</span>
              <div className="flex items-center space-x-2">
                <span>{forecast.condition}</span>
                <forecast.icon className="h-4 w-4" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

