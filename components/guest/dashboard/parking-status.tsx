"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, MapPin, Clock } from "lucide-react"
import { useParkingSpaces } from "@/hooks/use-parking-space"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/app/context/user-context"

export function ParkingStatus() {
  const { parkingSpaces, isLoading, error } = useParkingSpaces();
  const { userId, firstName, lastName } = useUser();
  const [userParking, setUserParking] = useState<ParkingSpace | null>(null);
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : "";

  useEffect(() => {
    if (parkingSpaces && parkingSpaces.length > 0 && fullName) {
      // Find the parking space that belongs to this user
      const userSpace = parkingSpaces.find(space => 
        space.user === fullName && 
        (space.status === "Occupied" || space.status === "Reserved")
      );
      setUserParking(userSpace || null);
    }
  }, [parkingSpaces, fullName]);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Parking</CardTitle>
        <Car className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">Error loading parking data</p>
        ) : !userParking ? (
          <div className="py-6 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Car className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <p className="text-muted-foreground">You are not currently parked</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center
                ${userParking.status === "Reserved" ? "bg-yellow-100" : "bg-green-100"}`}>
                <Car className={`h-8 w-8 
                  ${userParking.status === "Reserved" ? "text-yellow-600" : "text-green-600"}`} />
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-lg font-semibold">{userParking.name}</p>
              <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1 inline" /> 
                {userParking.location || "Unknown location"}
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                <Clock className="h-3 w-3 mr-1 inline" />
                Since: {formatDateTime(userParking.time_in)}
              </div>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full
                  ${userParking.status === "Reserved" 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-green-100 text-green-800"}`}>
                  {userParking.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}