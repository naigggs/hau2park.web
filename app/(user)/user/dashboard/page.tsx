"use client";

import React, { useState, useEffect } from 'react';
import { useUserInfo } from "@/hooks/use-user-info";
import { useDashboardParking } from "@/hooks/use-dashboard-parking";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Car,
  Clock,
  MapPin,
  CircleParking,
  RefreshCw,
  X,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUserInfo();
  const { locations, activeUsers, parkingSpaces, isLoading: parkingLoading, refresh } = useDashboardParking();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Initialize with empty strings to avoid hydration mismatch
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  
  // Calculate time-based values after component mounts
  useEffect(() => {
    const date = new Date();
    setNow(date);
    
    const hours = date.getHours();
    if (hours < 12) {
      setGreeting("Good Morning");
    } else if (hours < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
    
    setCurrentDate(format(date, "EEEE, MMMM d, yyyy"));
    setCurrentDateTime(format(date, "yyyy-MM-dd HH:mm:ss"));
    
    // Optional: Update the time every minute
    const intervalId = setInterval(() => {
      const newDate = new Date();
      setNow(newDate);
      setCurrentDateTime(format(newDate, "yyyy-MM-dd HH:mm:ss"));
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate overall parking statistics
  const totalSpaces = locations.reduce((sum, loc) => sum + loc.totalSpaces, 0);
  const occupiedSpaces = locations.reduce((sum, loc) => sum + loc.occupiedSpaces, 0);
  const availableSpaces = totalSpaces - occupiedSpaces;
  const occupancyRate = totalSpaces ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;

  // Get user's parking spot if any
  let userParkingSpace = null;
  if (user && parkingSpaces) {
    // Find the parking space assigned to this user
    userParkingSpace = parkingSpaces.find(
      space => space.user?.toLowerCase() === `${user.first_name} ${user.last_name}`.toLowerCase()
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}
            {userLoading ? ", User" : user ? `, ${user.first_name}` : ""}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-muted-foreground">
            <p>{currentDate}</p>
            {currentDate && (
              <>
                <div className="hidden sm:block text-xs">•</div>
                <p className="text-sm">
                  Current Time (UTC): {currentDateTime}
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={parkingLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${parkingLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User's Parking Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`col-span-1 ${userParkingSpace ? "border-primary/20" : "bg-muted/50"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Your Parking
                  </CardTitle>
                  {userParkingSpace && (
                    <Badge variant={userParkingSpace.verified_by_user ? "success" : "default"}>
                      {userParkingSpace.verified_by_user ? "Parked" : "Looking"}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {userLoading ? (
                    <Skeleton className="h-4 w-[150px]" />
                  ) : user && user.vehicle_plate_number ? (
                    `Vehicle: ${user.vehicle_plate_number}`
                  ) : (
                    "No vehicle registered"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parkingLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ) : userParkingSpace ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Parking Spot:</span>
                      <span className="font-medium">
                        {/* Use name and location directly from the parking space */}
                        {`${userParkingSpace.name} - ${userParkingSpace.location}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entry Time:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        {userParkingSpace.allocated_at || userParkingSpace.updated_at ? 
                          new Date(
                            userParkingSpace.allocated_at || userParkingSpace.updated_at
                          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "--:--"
                        }
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CircleParking className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      You are not currently parked or looking for parking
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      size="sm"
                      onClick={() => router.push('/user/chat-bot')}
                    >
                      Find Parking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overall Parking Stats */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Campus Parking Overview
                </CardTitle>
                <CardDescription>
                  Real-time parking availability across campus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {parkingLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Spaces</p>
                        <p className="text-2xl font-bold">{totalSpaces}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="text-2xl font-bold text-green-600">{availableSpaces}</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Occupied</p>
                        <p className="text-2xl font-bold text-amber-600">{occupiedSpaces}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Occupancy Rate</span>
                        <span className="text-sm font-medium">{occupancyRate}%</span>
                      </div>
                      <Progress value={occupancyRate} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : locations.length > 0 ? (
              locations.map((location, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {location.name}
                    </CardTitle>
                    <CardDescription>
                      {location.totalSpaces} total parking spaces
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="text-xl font-bold text-green-600">
                          {location.totalSpaces - location.occupiedSpaces}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Occupied</p>
                        <p className="text-xl font-bold text-amber-600">
                          {location.occupiedSpaces}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Occupancy</span>
                        <span className="text-sm font-medium">
                          {location.totalSpaces ? Math.round((location.occupiedSpaces / location.totalSpaces) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={location.totalSpaces ? (location.occupiedSpaces / location.totalSpaces) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="mt-2 pt-2 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Active users: {location.activeUsers}
                      </span>
                      <Badge variant="outline">
                        {location.reservedSpaces} Reserved
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <X className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-xl font-medium text-center">No location data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}