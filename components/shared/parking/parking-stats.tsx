import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ParkingStatsProps {
  parkingSpaces: ParkingSpace[];
}

export function ParkingStats({ parkingSpaces }: ParkingStatsProps) {
  // Calculate statistics
  const totalSpaces = parkingSpaces.length;
  const availableSpaces = parkingSpaces.filter(space => space.status === "Available").length;
  const occupiedSpaces = parkingSpaces.filter(space => space.status === "Occupied").length;
  const reservedSpaces = parkingSpaces.filter(space => space.status === "Reserved").length;
  
  const availablePercentage = totalSpaces > 0 ? Math.round((availableSpaces / totalSpaces) * 100) : 0;
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Spaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSpaces}</div>
          <div className="text-xs text-muted-foreground mt-1">Parking spaces in system</div>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-600">Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{availableSpaces}</div>
          <div className="mt-2 h-2 w-full bg-green-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${availablePercentage}%` }}
            />
          </div>
          <div className="text-xs text-green-600 mt-1">{availablePercentage}% available</div>
        </CardContent>
      </Card>
      
      <Card className="bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-600">Occupied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">{occupiedSpaces}</div>
          <div className="text-xs text-red-600 mt-1">Currently in use</div>
        </CardContent>
      </Card>
      
      <Card className="bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-600">Reserved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-700">{reservedSpaces}</div>
          <div className="text-xs text-amber-600 mt-1">Upcoming bookings</div>
        </CardContent>
      </Card>
    </div>
  );
}