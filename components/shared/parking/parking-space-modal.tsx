import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  User, 
  Clock, 
  Tag, 
  Timer, 
  MapPin, 
  TimerOff,
  CheckCircle2,
  LocateFixed
} from "lucide-react";
import { ParkingSpace } from "@/app/types/parking";
import { Badge } from "@/components/ui/badge";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-emerald-100 text-emerald-800 border-0">{status}</Badge>;
      case "Occupied":
        return <Badge className="bg-rose-100 text-rose-800 border-0">{status}</Badge>;
      case "Reserved":
        return <Badge className="bg-amber-100 text-amber-800 border-0">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formattedDate = space.allocated_at
    ? new Date(space.allocated_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Parking Space {space.name}</span>
              {getStatusBadge(space.status)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center my-4">
          <div className={`p-6 rounded-full ${
            space.status === "Available" 
              ? "bg-emerald-50" 
              : space.status === "Occupied" 
                ? "bg-rose-50"
                : "bg-amber-50"
          }`}>
            <Car className={`h-24 w-24 ${
              space.status === "Available" 
                ? "text-emerald-500" 
                : space.status === "Occupied" 
                  ? "text-rose-500" 
                  : "text-amber-500"
            }`} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Parking Information */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-muted p-3 rounded-md flex items-center gap-2.5">
              <Tag className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs font-medium text-muted-foreground block">SPACE NAME</span>
                <span className="font-medium">{space.name}</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md flex items-center gap-2.5">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs font-medium text-muted-foreground block">LOCATION</span>
                <span className="font-medium">{space.location || "N/A"}</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md flex items-center gap-2.5">
              <User className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs font-medium text-muted-foreground block">CURRENT USER</span>
                <span className="font-medium">{space.user || "N/A"}</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs font-medium text-muted-foreground block">TIME IN</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
            </div>

            {space.parking_end_time && (
              <div className="bg-muted p-3 rounded-md flex items-center gap-2.5">
                <TimerOff className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">TIME OUT</span>
                  <span className="font-medium">
                    {space.parking_end_time ? new Date(`1970-01-01T${space.parking_end_time}`).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {space.verified_by_user && (
              <div className="bg-muted p-3 rounded-md flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">VERIFICATION</span>
                  <span className="font-medium">Verified by user</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}