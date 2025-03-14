"use client"

import { useState, Suspense } from "react"
import { Car, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardParking } from "@/hooks/use-dashboard-parking"
import { Skeleton } from "@/components/ui/skeleton"

export default function StaffDashboard() {
  const { locations, activeUsers, error, isLoading } = useDashboardParking()
  const [activeLocation, setActiveLocation] = useState<string>(locations?.[0]?.name || "")

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center text-red-500">
          Error loading dashboard data: {error.message}
        </div>
      </div>
    )
  }

  const currentLocation = locations.find((loc) => loc.name === activeLocation) || locations[0]
  const freeSpaces = currentLocation?.totalSpaces - currentLocation?.occupiedSpaces || 0
  const occupancyRate = currentLocation 
    ? Math.round((currentLocation.occupiedSpaces / currentLocation.totalSpaces) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Parking Management</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <Select value={activeLocation} onValueChange={setActiveLocation}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.name} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[140px] w-full" />
            <Skeleton className="h-[140px] w-full" />
            <Skeleton className="h-[140px] w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentLocation?.totalSpaces || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Capacity of {currentLocation?.name}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available Spaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{freeSpaces}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {freeSpaces > 10 ? "Plenty of spaces available" : "Limited spaces remaining"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reserved Spaces</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{currentLocation?.reservedSpaces || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Spaces currently reserved</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {occupancyRate}% Utilized
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(currentLocation?.occupiedSpaces || 0) + (currentLocation?.reservedSpaces || 0)} / {currentLocation?.totalSpaces || 0} spaces
                    </span>
                  </div>
                  <Suspense fallback={<div className="h-2 w-full bg-muted animate-pulse rounded-full"></div>}>
                    <Progress value={occupancyRate} className="h-2" />
                  </Suspense>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col items-center p-3 border rounded-lg">
                      <span className="text-xs text-muted-foreground">Occupied</span>
                      <span className="text-lg font-bold">{currentLocation?.occupiedSpaces || 0}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 border rounded-lg">
                      <span className="text-xs text-muted-foreground">Reserved</span>
                      <span className="text-lg font-bold text-yellow-600">{currentLocation?.reservedSpaces || 0}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 border rounded-lg">
                      <span className="text-xs text-muted-foreground">Available</span>
                      <span className="text-lg font-bold text-green-600">{freeSpaces}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parking Space Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: currentLocation?.totalSpaces || 0 }).map((_, i) => {
                    const isOccupied = i < (currentLocation?.occupiedSpaces || 0);
                    const isReserved = !isOccupied && i < ((currentLocation?.occupiedSpaces || 0) + (currentLocation?.reservedSpaces || 0));
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm ${
                          isOccupied ? "bg-primary" : 
                          isReserved ? "bg-yellow-500" :
                          "bg-muted border border-border"
                        }`}
                        title={isOccupied ? "Occupied" : isReserved ? "Reserved" : "Available"}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted border border-border rounded-sm"></div>
                    <span>Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="parked">Parked</TabsTrigger>
              <TabsTrigger value="looking">Looking for Space</TabsTrigger>
            </TabsList>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <TabsContent value="all">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.vehicle_plate_number}</TableCell>
                          <TableCell>{user.entryTime}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "Parked" ? "default" : "secondary"}>{user.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="parked">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeUsers
                        .filter((u) => u.status === "Parked")
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.vehicle_plate_number}</TableCell>
                            <TableCell>{user.entryTime}</TableCell>
                            <TableCell>
                              <Badge>Parked</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="looking">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Entry Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeUsers
                        .filter((u) => u.status === "Looking")
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.vehicle_plate_number}</TableCell>
                            <TableCell>{user.entryTime}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">Looking</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}