import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ParkingMeterIcon as Park } from "lucide-react"

async function getParkStats() {
  // Simulated API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { totalParks: 25, newParks: 3 }
}

export async function ParkStats() {
  const { totalParks, newParks } = await getParkStats()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Parks This Month</CardTitle>
        <Park className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalParks}</div>
        <p className="text-xs text-muted-foreground">+{newParks} new parks</p>
      </CardContent>
    </Card>
  )
}

