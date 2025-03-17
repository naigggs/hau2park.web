"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParkingSpaceCard } from "@/components/shared/parking/parking-space-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParkingSpaces } from "@/hooks/use-parking-space";
import { ParkingSpaceModal } from "@/components/shared/parking/parking-space-modal";
import ParkingListLoading from "@/components/shared/loading/parking-list";
import { ParkingStats } from "@/components/shared/parking/parking-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParkingSpace } from "@/app/types/parking";
import { Input } from "@/components/ui/input";

export default function ParkingSpacesPage() {
  const { parkingSpaces, error, refresh, isLoading } = useParkingSpaces();
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredSpaces = parkingSpaces
    .filter(space => {
      // First apply status filter if set
      if (filter && filter !== "All") {
        if (space.status !== filter) return false;
      }
      
      // Then apply search query
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

  return (
    <div className="flex-1 space-y-6 p-6 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Parking Management</h2>
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

      <div className="flex flex-col md:flex-row gap-4 items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Input
            placeholder="Search spaces, locations or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <Tabs defaultValue="All" className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
            <TabsTrigger value="All" onClick={() => setFilter("All")}>All</TabsTrigger>
            <TabsTrigger value="Available" onClick={() => setFilter("Available")}>Available</TabsTrigger>
            <TabsTrigger value="Occupied" onClick={() => setFilter("Occupied")}>Occupied</TabsTrigger>
            <TabsTrigger value="Reserved" onClick={() => setFilter("Reserved")}>Reserved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ParkingListLoading key={index} />
            ))
          ) : filteredSpaces.length > 0 ? (
            filteredSpaces.map((space) => (
              <ParkingSpaceCard
                key={space.id}
                space={space}
                onClick={() => setSelectedSpace(space)}
              />
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center space-y-2">
                <p className="text-xl font-medium text-gray-500">No parking spaces found</p>
                <p className="text-gray-400">Try adjusting your filters or search query</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <ParkingSpaceModal
        space={selectedSpace}
        isOpen={!!selectedSpace}
        onClose={() => setSelectedSpace(null)}
      />
    </div>
  );
}