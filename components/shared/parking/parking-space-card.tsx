import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParkingSpace } from "@/app/types/parking";
import { Car, MapPin, User, Clock, Shield, AlertTriangle, TimerOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ParkingSpaceCardProps {
  space: ParkingSpace;
  onClick: () => void;
}

export function ParkingSpaceCard({ space, onClick }: ParkingSpaceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check for special conditions
  const isIllegalParking = space.status === "Occupied" && (!space.user || space.user === "None");
  const isReserved = space.status === "Reserved" && space.user;
  const hasTimeLimit = space.parking_end_time !== null && space.parking_end_time !== undefined;
  const isOvertime = space.parking_end_time && space.status === "Occupied" && 
    new Date() > new Date(`${new Date().toDateString()} ${space.parking_end_time}`);

  // Get status-specific styling with colored badges and shadows
  const getStatusStyles = (status: string) => {
    // First check special cases
    if (isIllegalParking) {
      return {
        shadow: "shadow-red-300/70",
        icon: "text-red-600",
        badge: <Badge variant="destructive" className="uppercase">Illegal Parking</Badge>
      };
    } else if (isOvertime) {
      return {
        shadow: "shadow-purple-300/70",
        icon: "text-purple-600",
        badge: <Badge variant="destructive" className="uppercase">Overtime</Badge>
      };
    }
    
    // Then standard statuses
    switch (status) {
      case "Available":
        return {
          shadow: "shadow-emerald-200/50",
          icon: "text-emerald-500",
          badge: <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">{status}</Badge>
        };
      case "Occupied":
        return {
          shadow: "shadow-rose-200/50",
          icon: "text-rose-500",
          badge: <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-200">{status}</Badge>
        };
      case "Reserved":
        return {
          shadow: "shadow-amber-200/50",
          icon: "text-amber-500",
          badge: <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">{status}</Badge>
        };
      default:
        return {
          shadow: "shadow-gray-200/50",
          icon: "text-muted-foreground",
          badge: <Badge variant="outline">{status}</Badge>
        };
    }
  };

  const styles = getStatusStyles(space.status);
  
  const formattedTime = space.allocated_at 
    ? new Date(space.allocated_at).toLocaleString('en-US', { 
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
    : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full"
    >
      <Card 
        className={`overflow-hidden cursor-pointer h-full transition-all rounded-xl ${styles.shadow} ${
          isHovered ? 'shadow-lg' : 'shadow-md'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header with car icon */}
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isIllegalParking || isOvertime ? 'bg-red-50' : 'bg-muted'}`}>
                {isIllegalParking ? (
                  <AlertTriangle className={`h-7 w-7 ${styles.icon}`} />
                ) : isOvertime ? (
                  <TimerOff className={`h-7 w-7 ${styles.icon}`} />
                ) : (
                  <Car className={`h-7 w-7 ${styles.icon}`} />
                )}
              </div>
              <h3 className="font-medium text-lg">{space.name}</h3>
            </div>
            {styles.badge}
          </div>

          <div className="p-4 flex-1 flex flex-col gap-3">
            {/* Location */}
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{space.location || "No location specified"}</span>
            </div>
            
            {/* User information if available */}
            <div className="flex items-center text-sm">
              <User className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-muted-foreground" />
              <span className="font-medium truncate">{space.user || "No user assigned"}</span>
            </div>
            
            {/* Time information if available */}
            {formattedTime && (
              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs bg-muted/40 p-2 rounded-md">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>Since {formattedTime}</span>
                  </div>
                  
                  {hasTimeLimit && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <TimerOff className="h-3 w-3 text-muted-foreground" />
                            <span>{space.parking_end_time}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Parking time limit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {space.verified_by_user && (
                    <Badge variant="outline" className="text-xs h-5 px-1 flex items-center gap-1 bg-transparent">
                      <Shield className="h-2.5 w-2.5" />
                      <span>Verified</span>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Additional indicators section */}
            {(isIllegalParking || isOvertime || isReserved) && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {isIllegalParking && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                          <span className="text-xs text-red-600 font-medium">Illegal</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Space is occupied without registered user</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {isOvertime && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
                          <span className="text-xs text-purple-600 font-medium">Overtime</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vehicle has exceeded the allowed parking time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {isReserved && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                          <span className="text-xs text-amber-600 font-medium">Reserved</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Space is reserved for {space.user}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}