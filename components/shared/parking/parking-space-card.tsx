"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Car, Clock, MapPin, User } from "lucide-react";

interface ParkingSpaceCardProps {
  space: ParkingSpace;
  onClick: () => void;
}

export function ParkingSpaceCard({ space, onClick }: ParkingSpaceCardProps) {
  // Define status-specific styles
  const statusStyles = {
    Available: {
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      indicator: "bg-green-500",
    },
    Occupied: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      indicator: "bg-red-500",
    },
    Reserved: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      indicator: "bg-amber-500",
    },
  };

  const style = statusStyles[space.status as keyof typeof statusStyles] || 
    statusStyles.Available;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={onClick}
        className={`cursor-pointer h-full overflow-hidden hover:shadow-lg transition-all duration-300 ${style.border} border-2`}
      >
        {/* Status indicator bar */}
        <div className={`h-1 w-full ${style.indicator}`} />
        
        <CardContent className="p-4">
          {/* Space name and status */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{space.name}</h3>
            <Badge 
              variant="outline" 
              className={`${style.bg} ${style.color} border-0`}
            >
              <span className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${style.indicator}`}></div>
                {space.status}
              </span>
            </Badge>
          </div>
          
          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="truncate">{space.location || "No location"}</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-3"></div>
          
          {/* User information */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <User className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="font-medium truncate">
              {space.user || "Unoccupied"}
            </span>
          </div>
          
          {/* Time information */}
          {space.allocated_at && (
            <div className="flex items-center text-xs text-gray-500 mt-2 bg-gray-50 p-1.5 px-2 rounded-md">
              <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
              <span>
                Since {new Date(space.allocated_at).toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </span>
            </div>
          )}

          {/* End time if available */}
          {space.parking_end_time && (
            <div className={`mt-2 text-xs px-2 py-1 rounded-md ${style.bg} ${style.color}`}>
              <span className="font-semibold">
                Until {new Date(`1970-01-01T${space.parking_end_time}`).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}