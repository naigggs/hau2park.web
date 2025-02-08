import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

const recentVisits = [
  { park: "Sunshine Park", date: "2023-05-15" },
  { park: "Greenwood Gardens", date: "2023-05-10" },
  { park: "Riverside Walk", date: "2023-05-05" },
]

export function RecentVisits() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Park Visits</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recentVisits.map((visit, index) => (
            <li key={index} className="flex justify-between text-sm">
              <span>{visit.park}</span>
              <span className="text-muted-foreground">{visit.date}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

