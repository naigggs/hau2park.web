"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParkingSpaceCard } from "@/components/shared/parking/parking-space-card";
import { Button } from "@/components/ui/button";
import { Car, RefreshCw, Filter, Search, Menu, MapPin, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useParkingSpaces } from "@/hooks/use-parking-space";
import { ParkingSpaceModal } from "@/components/shared/parking/parking-space-modal";
import ParkingListLoading from "@/components/shared/loading/parking-list";
import { ParkingStats } from "@/components/shared/parking/parking-stats";
import { ParkingSpace } from "@/app/types/parking";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ParkingSpacesPage() {
  const { parkingSpaces: rawParkingSpaces, error, refresh, isLoading } = useParkingSpaces();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use the media query hook to detect mobile view
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Helper to determine a valid status from a string value
  function determineValidStatus(status: string): "Available" | "Occupied" | "Reserved" {
    if (!status) return "Available";
    const normalized = status.toString().toLowerCase();
    if (normalized.includes("available")) return "Available";
    if (normalized.includes("occupied")) return "Occupied";
    if (normalized.includes("reserved")) return "Reserved";
    return "Available"; // Default fallback
  }
  
  // Validate parking space status and convert confidence to number
  const parkingSpaces = rawParkingSpaces.map(space => ({
    ...space,
    status: determineValidStatus(space.status),
    confidence: typeof space.confidence === 'string' ? parseFloat(space.confidence) : space.confidence
  }));

  // Handle selecting a parking space with proper type checking
  const handleSelectSpace = (space: ParkingSpace) => {
    // Ensure the status is one of the allowed values
    if (space.status !== "Available" && space.status !== "Occupied" && space.status !== "Reserved") {
      // Convert to a valid status if needed
      const validatedSpace = {
        ...space,
        status: determineValidStatus(space.status)
      };
      setSelectedSpace(validatedSpace);
    } else {
      setSelectedSpace(space);
    }
  };
  
  // Get unique locations from parking spaces
  const getUniqueLocations = (): string[] => {
    const locations = parkingSpaces
      .map(space => space.location || "No Location")
      .filter((location, index, self) => location && self.indexOf(location) === index);
    return ["All Locations", ...locations];
  };
  
  const uniqueLocations = getUniqueLocations();

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-gray-800">Error Loading Parking Spaces</h3>
          <p className="text-gray-500">{error.message || "An unknown error occurred"}</p>
          <Button onClick={refresh} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Filter spaces by status, location, and search query
  const filteredSpaces = parkingSpaces.filter(space => {
    // Apply status filter if not set to "All"
    if (activeTab !== "All" && space.status !== activeTab) {
      return false;
    }
    
    // Apply location filter if not set to "All Locations"
    if (selectedLocation !== "All Locations" && 
        (space.location !== selectedLocation && 
         (space.location || "No Location") !== selectedLocation)) {
      return false;
    }
    
    // Apply search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        space.name.toLowerCase().includes(query) ||
        (space.location?.toLowerCase().includes(query)) ||
        (space.user?.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Group spaces by location when showing all locations
  const groupedByLocation = () => {
    if (selectedLocation !== "All Locations") {
      // If a specific location is selected, don't group
      return { [selectedLocation]: filteredSpaces };
    }
    
    // Group spaces by location
    return filteredSpaces.reduce((groups: Record<string, ParkingSpace[]>, space) => {
      const location = space.location || "No Location";
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(space);
      return groups;
    }, {});
  };
  
  const spacesGroupedByLocation = groupedByLocation();
  const locationGroups = Object.keys(spacesGroupedByLocation).sort();

  // Count spaces by status for badge indicators
  const availableCount = parkingSpaces.filter(space => space.status === "Available").length;
  const occupiedCount = parkingSpaces.filter(space => space.status === "Occupied").length;
  const reservedCount = parkingSpaces.filter(space => space.status === "Reserved").length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Car className="h-7 w-7 text-primary" />
              Parking Management
            </h2>
            <p className="text-muted-foreground mt-1">View and manage parking spaces</p>
          </div>
          <Button 
            variant="outline"
            size="icon"
            onClick={refresh}
            title="Refresh parking spaces"
            disabled={isLoading}
            className="rounded-full h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="mt-6">
          <ParkingStats parkingSpaces={parkingSpaces} />
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Input
            placeholder="Search spaces, locations or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          {/* Location filter */}
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2 truncate">
                <Building className="h-4 w-4" />
                <SelectValue placeholder="Select location" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Locations</SelectLabel>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {/* Status filter - mobile/desktop responsive */}
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center">
                  <span className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {activeTab}
                  </span>
                  {activeTab === "All" ? (
                    <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs">
                      {parkingSpaces.length}
                    </span>
                  ) : activeTab === "Available" ? (
                    <span className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-xs">
                      {availableCount}
                    </span>
                  ) : activeTab === "Occupied" ? (
                    <span className="bg-rose-100 text-rose-800 rounded-full px-2 py-0.5 text-xs">
                      {occupiedCount}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">
                      {reservedCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("All")} className="flex justify-between">
                  All <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs">{parkingSpaces.length}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("Available")} className="flex justify-between">
                  Available <span className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-xs">{availableCount}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("Occupied")} className="flex justify-between">
                  Occupied <span className="bg-rose-100 text-rose-800 rounded-full px-2 py-0.5 text-xs">{occupiedCount}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("Reserved")} className="flex justify-between">
                  Reserved <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">{reservedCount}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
                <TabsTrigger value="All">
                  All <span className="ml-1.5 bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs">{parkingSpaces.length}</span>
                </TabsTrigger>
                <TabsTrigger value="Available">
                  Available <span className="ml-1.5 bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-xs">{availableCount}</span>
                </TabsTrigger>
                <TabsTrigger value="Occupied">
                  Occupied <span className="ml-1.5 bg-rose-100 text-rose-800 rounded-full px-2 py-0.5 text-xs">{occupiedCount}</span>
                </TabsTrigger>
                <TabsTrigger value="Reserved">
                  Reserved <span className="ml-1.5 bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">{reservedCount}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <ParkingListLoading key={index} />
            ))}
          </motion.div>
        ) : filteredSpaces.length > 0 ? (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {locationGroups.map((location) => (
              <div key={location} className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">{location}</h3>
                  <Badge variant="outline" className="ml-2">
                    {spacesGroupedByLocation[location].length} spaces
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {spacesGroupedByLocation[location].map((space) => (
                    <ParkingSpaceCard
                      key={space.id}
                      space={space}
                      onClick={() => handleSelectSpace(space)}
                    />
                  ))}
                </div>
                <div className="border-b border-border/40 my-4"></div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="col-span-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg p-6">
              <Car className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No parking spaces found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your filters or search query</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveTab("All");
                  setSelectedLocation("All Locations");
                  setSearchQuery("");
                }} 
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ParkingSpaceModal
        space={selectedSpace}
        isOpen={!!selectedSpace}
        onClose={() => setSelectedSpace(null)}
      />
    </div>
  );
}