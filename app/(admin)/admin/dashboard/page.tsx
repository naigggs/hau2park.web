'use client';

import { useEffect, useState } from "react";
import { useDashboardParking } from "@/hooks/use-dashboard-parking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Car, Clock, CreditCard, DollarSign, RefreshCcw, Search, ShieldAlert, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { locations, activeUsers, isLoading, error, refresh } = useDashboardParking();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Compute illegal parking spots
  const illegalSpots = locations.flatMap((location) => {
    const count = Math.max(0, location.occupiedSpaces - location.activeUsers);
    return Array.from({ length: count }).map((_, i) => ({
      id: `${location.name}-${i + 1}`,
      spot: `P${i + 1}`,
      location: location.name,
      status: "Illegal"
    }));
  });

  // Properly parked users
  const properlyParked = activeUsers.filter(user => user.status === "Parked");
  
  // Looking for parking users
  const lookingForParking = activeUsers.filter(user => user.status === "Looking");

  // Calculate occupancy rates
  const totalSpaces = locations.reduce((acc, loc) => acc + loc.totalSpaces, 0);
  const occupiedSpaces = locations.reduce((acc, loc) => acc + loc.occupiedSpaces, 0);
  const reservedSpaces = locations.reduce((acc, loc) => acc + loc.reservedSpaces, 0);
  const occupancyRate = totalSpaces > 0 ? ((occupiedSpaces + reservedSpaces) / totalSpaces) * 100 : 0;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Function to get filtered locations based on selection
  const getFilteredLocations = () => {
    if (selectedLocation === "all") return locations;
    return locations.filter(location => location.name === selectedLocation);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refresh();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="p-8 bg-red-50 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h2 className="text-xl font-semibold text-red-700">Dashboard Error</h2>
          </div>
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button variant="destructive" onClick={handleRefresh} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass-style header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/90 border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Parking Dashboard</h1>
              <p className="text-sm text-slate-500">Real-time parking management system</p>
            </div>
            
            <div className="flex items-center gap-4 mt-3 sm:mt-0">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{currentTime.toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString([], { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                className="rounded-full hover:bg-slate-100"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Overview stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-slate-200">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-20 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Capacity</CardTitle>
                  <Car className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{totalSpaces}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span>Across {locations.length} locations</span>
                  </div>
                  <Progress 
                    value={occupancyRate} 
                    className="h-1 mt-3" 
                  />
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-600">Occupied</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{occupiedSpaces}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">
                      {totalSpaces > 0 ? ((occupiedSpaces / totalSpaces) * 100).toFixed(1) : 0}% of capacity
                    </span>
                    <Badge variant={occupiedSpaces > totalSpaces / 2 ? "default" : "outline"} className="text-xs">
                      {properlyParked.length} users
                    </Badge>
                  </div>
                  <Progress 
                    value={totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0} 
                    className="h-1 mt-3" 
                  />
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-600">Reserved</CardTitle>
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{reservedSpaces}</div>
                  <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
                    <span>
                      {totalSpaces > 0 ? ((reservedSpaces / totalSpaces) * 100).toFixed(1) : 0}% of capacity
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {lookingForParking.length} pending
                    </Badge>
                  </div>
                  <Progress 
                    value={totalSpaces > 0 ? (reservedSpaces / totalSpaces) * 100 : 0} 
                    className="h-1 mt-3" 
                  />
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-slate-600">Occupancy Rate</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {occupancyRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>Overall utilization</span>
                    <Badge 
                      variant={occupancyRate > 85 ? "destructive" : occupancyRate > 50 ? "default" : "outline"} 
                      className="text-xs"
                    >
                      {occupancyRate > 85 ? "High" : occupancyRate > 50 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                  <Progress 
                    value={occupancyRate} 
                    className={cn(
                      "h-1 mt-3", 
                      occupancyRate > 85 ? "bg-red-100" : occupancyRate > 50 ? "bg-orange-100" : "bg-green-100"
                    )}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="parkingStatus" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Status
              </TabsTrigger>
              <TabsTrigger value="visualization" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Visualization
              </TabsTrigger>
            </TabsList>
            
            {isLoading && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 animate-pulse">Refreshing data...</span>
              </div>
            )}
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Locations Summary */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-800">Locations Summary</CardTitle>
                <CardDescription>Overview of all parking locations</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {isLoading ? (
                  <div className="px-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[320px]">
                    <div className="px-6 space-y-4">
                      {locations.map((location, i) => (
                        <div key={location.name} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-slate-800">{location.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {location.occupiedSpaces + location.reservedSpaces}/{location.totalSpaces} spaces
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-slate-500">Occupied</p>
                                <p className="font-medium text-slate-700">{location.occupiedSpaces} spaces</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Reserved</p>
                                <p className="font-medium text-slate-700">{location.reservedSpaces} spaces</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Rate</p>
                                <p className="font-medium text-slate-700">
                                  {((location.occupiedSpaces + location.reservedSpaces) / location.totalSpaces * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                            <Progress
                              value={((location.occupiedSpaces + location.reservedSpaces) / location.totalSpaces) * 100}
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Recent activity / stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-slate-800">Recent Entries</CardTitle>
                    <Badge variant="outline" className="font-normal">{properlyParked.length} Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {isLoading ? (
                    <div className="px-6 space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px]">
                      <div className="px-6 space-y-3">
                        {properlyParked.length > 0 ? (
                          properlyParked.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md">
                              <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                                <AvatarFallback className="bg-slate-100 text-slate-600">
                                  {user.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-slate-800">{user.name}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>{user.vehicle_plate_number}</span>
                                  <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                  <span>Entry: {user.entryTime}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                            <Car className="h-10 w-10 text-slate-300 mb-2" />
                            <p className="text-slate-500 text-sm">No active users parked</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-slate-800">Illegal Parking</CardTitle>
                    <Badge variant={illegalSpots.length ? "destructive" : "outline"} className="font-normal">
                      {illegalSpots.length} Detected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {isLoading ? (
                    <div className="px-6 space-y-3">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px]">
                      <div className="px-6">
                        {illegalSpots.length > 0 ? (
                          <div className="space-y-3">
                            {illegalSpots.map((spot) => (
                              <div 
                                key={spot.id} 
                                className="p-3 rounded-md bg-red-50 border border-red-100 flex justify-between items-center"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" />
                                    <p className="font-medium text-sm text-red-700">
                                      {spot.spot} at {spot.location}
                                    </p>
                                  </div>
                                  <p className="text-xs text-red-500 mt-1">
                                    Unregistered vehicle detected
                                  </p>
                                </div>
                                <Badge variant="destructive" className="text-xs">
                                  Illegal
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                            <ShieldAlert className="h-10 w-10 text-slate-300 mb-2" />
                            <p className="text-slate-500 text-sm">No illegal parking detected</p>
                            <p className="text-xs text-slate-400 mt-1">All vehicles properly registered</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Parking Status Tab */}
          <TabsContent value="parkingStatus">
            <div className="space-y-6">
              {/* Properly Parked Users */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-800">Properly Parked Users</CardTitle>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-500">{properlyParked.length} users</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {isLoading ? (
                    <div className="px-6">
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : properlyParked.length > 0 ? (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>User</TableHead>
                            <TableHead className="hidden sm:table-cell">Plate</TableHead>
                            <TableHead>Entry Time</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {properlyParked.map((user) => (
                            <TableRow key={user.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-slate-100 text-slate-600">
                                      {user.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="truncate">
                                    <span className="text-sm font-medium">{user.name}</span>
                                    <p className="sm:hidden text-xs text-slate-500">{user.vehicle_plate_number}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">{user.vehicle_plate_number}</TableCell>
                              <TableCell>{user.entryTime}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  {user.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Car className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No properly parked users</p>
                      <p className="text-sm text-slate-400 mt-1">All parking spots are currently available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Illegal Parking */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-800">Illegal Parking</CardTitle>
                    <Badge 
                      variant={illegalSpots.length > 0 ? "destructive" : "outline"} 
                      className="font-normal"
                    >
                      {illegalSpots.length} violations
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {isLoading ? (
                    <div className="px-6">
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : illegalSpots.length > 0 ? (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Spot</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {illegalSpots.map((spot) => (
                            <TableRow key={spot.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{spot.spot}</TableCell>
                              <TableCell>{spot.location}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="destructive">
                                  {spot.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ShieldAlert className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No illegal parking detected</p>
                      <p className="text-sm text-slate-400 mt-1">All vehicles are properly registered</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visualization Tab */}
          <TabsContent value="visualization">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Parking Space Visualization</h2>
                
                <div className="flex gap-2 items-center">
                  <Select 
                    value={selectedLocation} 
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFilteredLocations().map((location) => (
                    <Card key={location.name} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-slate-800">{location.name}</CardTitle>
                          <Badge variant="outline" className="font-normal">
                            {location.activeUsers} users
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Space visualization */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Space utilization</span>
                            <span className="font-medium">
                              {location.occupiedSpaces + location.reservedSpaces}/{location.totalSpaces} spaces
                            </span>
                          </div>
                          <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-blue-500"
                                style={{ 
                                  width: `${(location.occupiedSpaces / location.totalSpaces) * 100}%`,
                                  transition: 'width 0.5s ease-in-out' 
                                }}
                              />
                              <div 
                                className="absolute top-0 left-0 h-full bg-orange-400"
                                style={{ 
                                  width: `${(location.reservedSpaces / location.totalSpaces) * 100}%`,
                                  marginLeft: `${(location.occupiedSpaces / location.totalSpaces) * 100}%`,
                                  transition: 'width 0.5s ease-in-out, margin-left 0.5s ease-in-out' 
                                }}
                              />
                            </div>
                          </div>

                          {/* Detailed space breakdown */}
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                              <p className="text-xs text-slate-500 mb-1">Total</p>
                              <p className="text-lg font-semibold text-slate-800">{location.totalSpaces}</p>
                              <p className="text-xs text-slate-500">spaces</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                              <p className="text-xs text-blue-600 mb-1">Occupied</p>
                              <p className="text-lg font-semibold text-blue-700">{location.occupiedSpaces}</p>
                              <p className="text-xs text-blue-500">
                                {location.totalSpaces > 0 ? ((location.occupiedSpaces / location.totalSpaces) * 100).toFixed(0) : 0}%
                              </p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                              <p className="text-xs text-orange-600 mb-1">Reserved</p>
                              <p className="text-lg font-semibold text-orange-700">{location.reservedSpaces}</p>
                              <p className="text-xs text-orange-500">
                                {location.totalSpaces > 0 ? ((location.reservedSpaces / location.totalSpaces) * 100).toFixed(0) : 0}%
                              </p>
                            </div>
                          </div>

                          {/* Visual parking spaces representation */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-slate-700">Parking spots</h4>
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="h-3 w-3 rounded-sm bg-blue-500"></div>
                                  <span className="text-slate-600">Occupied</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-3 w-3 rounded-sm bg-orange-400"></div>
                                  <span className="text-slate-600">Reserved</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-3 w-3 rounded-sm border border-slate-300 bg-white"></div>
                                  <span className="text-slate-600">Available</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-8 gap-1.5">
                              {Array.from({ length: location.totalSpaces }).map((_, i) => {
                                const isOccupied = i < location.occupiedSpaces;
                                const isReserved = !isOccupied && i < (location.occupiedSpaces + location.reservedSpaces);
                                
                                return (
                                  <div 
                                    key={i} 
                                    className={cn(
                                      "aspect-square rounded-sm border flex items-center justify-center text-xs",
                                      isOccupied 
                                        ? "bg-blue-500 border-blue-600 text-white" 
                                        : isReserved
                                          ? "bg-orange-400 border-orange-500 text-white"
                                          : "bg-white border-slate-300 text-slate-500"
                                    )}
                                  >
                                    {i + 1}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}