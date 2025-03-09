"use client"

import { useState } from "react"
import { Car, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ParkingDashboard() {
  const [activeLocation, setActiveLocation] = useState("Main Garage")

  // Mock data
  const locations = [
    {
      name: "Main Garage",
      totalSpaces: 120,
      occupiedSpaces: 87,
      activeUsers: 42,
    },
    {
      name: "North Lot",
      totalSpaces: 80,
      occupiedSpaces: 45,
      activeUsers: 28,
    },
  ]

  const activeUsers = [
    { id: 1, name: "Alex Johnson", licensePlate: "ABC-1234", entryTime: "08:30 AM", status: "Parked" },
    { id: 2, name: "Maria Garcia", licensePlate: "XYZ-5678", entryTime: "09:15 AM", status: "Parked" },
    { id: 3, name: "Sam Wilson", licensePlate: "DEF-9012", entryTime: "10:05 AM", status: "Parked" },
    { id: 4, name: "Taylor Swift", licensePlate: "GHI-3456", entryTime: "10:30 AM", status: "Parked" },
    { id: 5, name: "John Smith", licensePlate: "JKL-7890", entryTime: "11:20 AM", status: "Looking" },
  ]

  const currentLocation = locations.find((loc) => loc.name === activeLocation) || locations[0]
  const freeSpaces = currentLocation.totalSpaces - currentLocation.occupiedSpaces
  const occupancyRate = Math.round((currentLocation.occupiedSpaces / currentLocation.totalSpaces) * 100)

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentLocation.totalSpaces}</div>
            <p className="text-xs text-muted-foreground mt-1">Capacity of {currentLocation.name}</p>
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
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentLocation.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Users currently in the system</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{occupancyRate}% Occupied</span>
                <span className="text-sm text-muted-foreground">
                  {currentLocation.occupiedSpaces} / {currentLocation.totalSpaces} spaces
                </span>
              </div>
              <Progress value={occupancyRate} className="h-2" />
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <span className="text-xs text-muted-foreground">Occupied</span>
                  <span className="text-lg font-bold">{currentLocation.occupiedSpaces}</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <span className="text-xs text-muted-foreground">Available</span>
                  <span className="text-lg font-bold text-green-600">{freeSpaces}</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <span className="text-xs text-muted-foreground">Reserved</span>
                  <span className="text-lg font-bold">0</span>
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
              {Array.from({ length: currentLocation.totalSpaces }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    i < currentLocation.occupiedSpaces ? "bg-primary" : "bg-muted border border-border"
                  }`}
                  title={i < currentLocation.occupiedSpaces ? "Occupied" : "Available"}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-sm"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted border border-border rounded-sm"></div>
                <span>Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
                      <TableCell>{user.licensePlate}</TableCell>
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
                        <TableCell>{user.licensePlate}</TableCell>
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
                        <TableCell>{user.licensePlate}</TableCell>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

