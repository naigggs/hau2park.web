"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wifi,
  Coffee,
  Bike,
  Utensils,
  Car,
  TreesIcon as Tree,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const parkingAreas = [
  { id: "central", name: "Central Parking" },
  { id: "north", name: "North Parking" },
  { id: "east", name: "East Parking" },
];

type Amenity = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  status: "operational" | "unavailable";
};

type AmenitiesByArea = {
  [key: string]: Amenity[];
};

const amenitiesByArea: AmenitiesByArea = {
  central: [
    { name: "Wi-Fi", icon: Wifi, status: "operational" },
    { name: "Café", icon: Coffee, status: "operational" },
    { name: "Bike Rental", icon: Bike, status: "unavailable" },
    { name: "Restaurant", icon: Utensils, status: "operational" },
  ],
  north: [{ name: "Wi-Fi", icon: Wifi, status: "operational" }],
  east: [
    { name: "Wi-Fi", icon: Wifi, status: "unavailable" },
    { name: "Café", icon: Coffee, status: "operational" },
    { name: "Car Wash", icon: Car, status: "unavailable" },
  ],
};

export function ParkAmenities() {
  const [selectedArea, setSelectedArea] = useState(parkingAreas[0].id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Park Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select parking area" />
          </SelectTrigger>
          <SelectContent>
            {parkingAreas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ul className="space-y-2">
          {amenitiesByArea[selectedArea].map((amenity, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <amenity.icon className="h-4 w-4 text-muted-foreground" />
                <span>{amenity.name}</span>
              </div>
              <Badge
                variant={
                  amenity.status === "operational" ? "default" : "secondary"
                }
              >
                {amenity.status === "operational" ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {amenity.status}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
