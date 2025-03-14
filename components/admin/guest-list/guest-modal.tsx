"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { updateVisitorApprovalStatus } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Calendar, 
  Clock, 
  FileText,
  Timer, 
  Car, 
  Mail,
  CheckCircle,
  XCircle,
  Info,
  Tag,
  Phone
} from "lucide-react";
import { GuestList } from "@/app/types/guest-list";

interface GuestModalProps {
  guest: GuestList | null;
  onClose: () => void;
}

export function GuestModal({ guest, onClose }: Readonly<GuestModalProps>) {
  const { toast } = useToast();
  
  if (!guest) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const handleAccept = async () => {
    if (guest) {
      try {
        await updateVisitorApprovalStatus(guest.id, "Approved", guest.user_id.email, guest.user_id.user_id, guest.appointment_date);
        toast({
          title: "Success",
          description: "Guest has been approved.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to approve guest.",
        });
      } finally {
        onClose();
      }
    }
  };

  const handleDecline = async () => {
    if (guest) {
      try {
        await updateVisitorApprovalStatus(guest.id, "Declined", guest.user_id.email, guest.user_id.user_id, guest.appointment_date);
        toast({
          title: "Success",
          description: "Guest has been declined.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to decline guest.",
        });
      } finally {
        onClose();
      }
    }
  };

  // Get status badge variant based on status value
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Approved":
        return { variant: "success", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case "Declined":
        return { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> };
      case "Open":
        return { variant: "default", icon: <Info className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "secondary", icon: <Info className="h-3 w-3 mr-1" /> };
    }
  };

  const statusBadge = getStatusBadge(guest.status);

  return (
    <Dialog open={!!guest} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between ml-3">
            <span className="text-lg font-bold flex items-center gap-2">
             QR - {guest.id}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="w-full border-0">
          <div className="space-y-4 p-3">
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">NAME</span>
                <span className="font-medium flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {guest.user_id.first_name} {guest.user_id.last_name}
                </span>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">EMAIL</span>
                <span className="font-medium flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {guest.user_id.email}
                </span>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">PHONE NUMBER</span>
                <span className="font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {guest.user_id.phone || "N/A"}
                </span>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">TITLE</span>
                <span className="font-medium">{guest.title}</span>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">APPOINTMENT DATE</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(guest.appointment_date)}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">VEHICLE PLATE NUMBER</span>
                <span className="font-medium flex items-center gap-1">
                  <Car className="h-4 w-4" />
                  {guest.user_id.vehicle_plate_number || "N/A"}
                </span>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <span className="text-xs font-medium text-muted-foreground block">CREATED AT</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(guest.created_at)}
                </span>
              </div>
            </div>

            {/* Parking Details */}
            <div className="bg-primary/5 p-3 rounded-md mt-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Visit Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-background p-3 rounded-md">
                  <span className="text-xs font-medium text-muted-foreground block">PURPOSE OF VISIT</span>
                  <span className="font-medium">{guest.purpose_of_visit}</span>
                </div>
                
                <div className="bg-background p-3 rounded-md">
                  <span className="text-xs font-medium text-muted-foreground block">PARKING TIME</span>
                  <span className="font-medium flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {guest.parking_start_time} - {guest.parking_end_time}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between border-t pt-4 mt-2 p-3">
            <div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
            
            {guest.status === "Open" && (
              <div className="flex justify-end gap-x-2">
                <Button 
                  onClick={handleAccept}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept
                </Button>
                <Button 
                  onClick={handleDecline} 
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
