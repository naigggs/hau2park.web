import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Car, User, Clock, Tag, Timer, MapPin, TimerOff } from "lucide-react";

interface ParkingSpaceModalProps {
  space: ParkingSpace | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ParkingSpaceModal({
  space,
  isOpen,
  onClose,
}: ParkingSpaceModalProps) {
  if (!space) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between ml-3">
            <span className="text-lg font-bold flex items-center gap-2">
              Parking Space - {space.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="w-full border-0">
          <div className="space-y-4 p-3">
            {/* Parking Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">
                  SPACE NAME
                </span>
                <span className="font-medium flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {space.name}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">
                  LOCATION
                </span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {space.location || "N/A"}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">
                  STATUS
                </span>
                <span className="font-medium flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {space.status}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">
                  CURRENT USER
                </span>
                <span className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {space.user || "N/A"}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md col-span-2">
                <span className="text-xs font-medium text-muted-foreground block">
                  TIME IN
                </span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {space.allocated_at
                    ? new Date(space.allocated_at).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })
                    : "N/A"}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md col-span-2">
                <span className="text-xs font-medium text-muted-foreground block">
                  TIME OUT
                </span>
                <span className="font-medium flex items-center gap-1">
                  <TimerOff className="h-4 w-4" />
                  {space.parking_end_time ? new Date(`1970-01-01T${space.parking_end_time}`).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t pt-4 mt-2 p-3">
            <div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
