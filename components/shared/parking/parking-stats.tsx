import { ParkingSpace } from "@/app/types/parking";
import { Card } from "@/components/ui/card";
import { Car, Timer, Calendar, AlertTriangle } from "lucide-react";

interface ParkingStatsProps {
  parkingSpaces: ParkingSpace[];
}

export function ParkingStats({ parkingSpaces }: ParkingStatsProps) {
  const totalSpaces = parkingSpaces.length;
  const availableSpaces = parkingSpaces.filter(space => space.status === "Available").length;
  const occupiedSpaces = parkingSpaces.filter(space => space.status === "Occupied").length;
  const reservedSpaces = parkingSpaces.filter(space => space.status === "Reserved").length;
  const illegalParkingSpaces = parkingSpaces.filter(space => 
    space.status === "Occupied" && (!space.user || space.user === "None")
  ).length;
  
  const availablePercentage = totalSpaces > 0 ? Math.round((availableSpaces / totalSpaces) * 100) : 0;
  const occupiedPercentage = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;
  const reservedPercentage = totalSpaces > 0 ? Math.round((reservedSpaces / totalSpaces) * 100) : 0;
  const illegalPercentage = totalSpaces > 0 ? Math.round((illegalParkingSpaces / totalSpaces) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="p-4 flex items-center">
        <div className="bg-primary/10 p-3 rounded-full mr-4">
          <Car className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Spaces</p>
          <h4 className="text-2xl font-bold">{totalSpaces}</h4>
        </div>
      </Card>

      <Card className={`p-4 flex items-center ${availableSpaces === 0 ? 'bg-muted/50' : ''}`}>
        <div className="bg-emerald-100 p-3 rounded-full mr-4">
          <Timer className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Available</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-emerald-600">{availableSpaces}</h4>
            <span className="text-sm text-muted-foreground">{availablePercentage}%</span>
          </div>
        </div>
      </Card>
      
      <Card className={`p-4 flex items-center ${occupiedSpaces === 0 ? 'bg-muted/50' : ''}`}>
        <div className="bg-rose-100 p-3 rounded-full mr-4">
          <Car className="h-6 w-6 text-rose-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Occupied</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-rose-600">{occupiedSpaces}</h4>
            <span className="text-sm text-muted-foreground">{occupiedPercentage}%</span>
          </div>
        </div>
      </Card>
      
      <Card className={`p-4 flex items-center ${reservedSpaces === 0 ? 'bg-muted/50' : ''}`}>
        <div className="bg-amber-100 p-3 rounded-full mr-4">
          <Calendar className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Reserved</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-amber-600">{reservedSpaces}</h4>
            <span className="text-sm text-muted-foreground">{reservedPercentage}%</span>
          </div>
        </div>
      </Card>
      
      <Card className={`p-4 flex items-center ${illegalParkingSpaces === 0 ? 'bg-muted/50' : 'bg-red-50/30'}`}>
        <div className="bg-red-100 p-3 rounded-full mr-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Illegal Parking</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-red-600">{illegalParkingSpaces}</h4>
            <span className="text-sm text-muted-foreground">{illegalPercentage}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}