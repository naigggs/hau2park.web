"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParkingSpaceCard } from "@/components/admin/parking/parking-space-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
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
import { ParkingSpaceModal } from "@/components/admin/parking/parking-space-modal";

export default function ParkingSpacesPage() {
  const { parkingSpaces, error, refresh, isLoading } = useParkingSpaces();
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  if (error) {
    return <div>Error loading parking spaces</div>;
  }

  const filteredSpaces =
    filter && filter !== "All"
      ? parkingSpaces.filter((space) => space.status === filter)
      : parkingSpaces;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Parking Spaces</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            title="Refresh parking spaces"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Select onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <AnimatePresence>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-3 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : (
            filteredSpaces?.map((space) => (
              <ParkingSpaceCard
                key={space.id}
                space={space}
                onClick={() => setSelectedSpace(space)}
              />
            ))
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
