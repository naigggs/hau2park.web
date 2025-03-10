import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimerOff } from "lucide-react";
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
  const isIllegalParking = space.status === "Occupied" && space.user === "None";
  const isReserved = space.status === "Reserved" && space.user;
  const hasTimeLimit = space.time_out !== null && space.time_out !== undefined;
  const isOvertime = space.parking_end_time && space.status === "Occupied" && 
    new Date() > new Date(`${new Date().toDateString()} ${space.parking_end_time}`);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {space.name}
            {hasTimeLimit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <TimerOff className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Has time limit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <div className="relative">
            {space.status === "Occupied" || space.status === "Reserved" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-16 h-16 ${space.status === "Reserved" ? "text-yellow-500" : "text-blue-500"}`}
                >
                  <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                  <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                  <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                </svg>
              </>
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                Empty
              </div>
            )}
          </div>
          {isIllegalParking && (
            <Badge variant="destructive" className="text-center uppercase">
              Illegal Parking
            </Badge>
          )}
          {isReserved && (
            <Badge variant="default" className="text-center uppercase">
              Reserved
            </Badge>
          )}
          {isOvertime && (
            <Badge variant="destructive" className="text-center uppercase mt-1">
              Overtime
            </Badge>
          )}
          <p className="mt-4 text-sm text-gray-600">Status: {space.status}</p>
          <p className="text-sm text-gray-600">
            Location: {space.location || "N/A"}
          </p>
          <p className="text-sm text-gray-600">User: {space.user || "N/A"}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
