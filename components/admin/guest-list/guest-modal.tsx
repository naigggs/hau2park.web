"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { updateVisitorApprovalStatus } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Badge,
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
  Phone,
  Loader2,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { GuestList } from "@/app/types/guest-list";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";

interface GuestModalProps {
  guest: GuestList | null;
  onClose: () => void;
  onStatusChange?: (guestId: number, newStatus: string) => void;
}

export function GuestModal({ guest, onClose, onStatusChange }: Readonly<GuestModalProps>) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isDesktopUI = useMediaQuery("(min-width: 768px)");

  if (!guest) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  // Format time to be more elegant
  const formatTimeRange = (startTime: string, endTime: string) => {
    // Try to convert from 24-hour format to 12-hour format with AM/PM
    try {
      const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      };
      
      return (
        <span className="inline-flex items-center font-medium">
          <span>{formatTime(startTime)}</span>
          <ArrowRight className="h-3 w-3 mx-1.5 text-muted-foreground/70" />
          <span>{formatTime(endTime)}</span>
        </span>
      );
    } catch (e) {
      // Fallback to original format if parsing fails
      return `${startTime} - ${endTime}`;
    }
  };

  const handleAccept = async () => {
    if (guest) {
      try {
        setIsLoading(true);
        await updateVisitorApprovalStatus(guest.id, "Approved", guest.user_id.email, guest.user_id.user_id, guest.appointment_date);
        onStatusChange?.(guest.id, "Approved");
        toast({
          title: "Guest approved",
          description: "The guest has been successfully approved.",
        });
      } catch (error) {
        toast({
          title: "Approval failed",
          description: "There was an error approving this guest.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        onClose();
      }
    }
  };

  const handleDecline = async () => {
    if (guest) {
      try {
        setIsLoading(true);
        await updateVisitorApprovalStatus(guest.id, "Declined", guest.user_id.email, guest.user_id.user_id, guest.appointment_date);
        onStatusChange?.(guest.id, "Declined");
        toast({
          title: "Guest declined",
          description: "The guest has been declined.",
        });
      } catch (error) {
        toast({
          title: "Action failed",
          description: "There was an error declining this guest.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        onClose();
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case "approved":
        return { 
          bg: "bg-emerald-50 dark:bg-emerald-950/10", 
          text: "text-emerald-700 dark:text-emerald-400",
          icon: <CheckCircle className="h-4 w-4 mr-2" />
        };
      case "declined":
        return { 
          bg: "bg-rose-50 dark:bg-rose-950/10", 
          text: "text-rose-700 dark:text-rose-400",
          icon: <XCircle className="h-4 w-4 mr-2" />
        };
      case "open":
        return { 
          bg: "bg-sky-50 dark:bg-sky-950/10", 
          text: "text-sky-700 dark:text-sky-400",
          icon: <Clock className="h-4 w-4 mr-2" />
        };
      default:
        return { 
          bg: "bg-gray-50 dark:bg-gray-800/10", 
          text: "text-gray-700 dark:text-gray-400",
          icon: <Clock className="h-4 w-4 mr-2" />
        };
    }
  };

  const statusStyle = getStatusStyle(guest.status);

  const ModalUI = (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <span>Guest Request Details</span>
        </DialogTitle>
        <div className={`rounded-md px-3 py-1.5 text-sm flex items-center ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.icon}
          <span className="font-medium">Status: {guest.status}</span>
        </div>
      </DialogHeader>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Information
          </h3>

          <div className="rounded-lg border p-4 space-y-4 bg-muted/30 hover:bg-muted/40 transition-colors">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Full Name</p>
              <p className="font-medium flex items-center gap-2 mt-1">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {guest.user_id.first_name} {guest.user_id.last_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="font-medium truncate flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {guest.user_id.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <p className="font-medium flex items-center gap-2 mt-1">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {guest.user_id.phone || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Visit Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Visit Details
          </h3>

          <div className="rounded-lg border p-4 space-y-4 bg-muted/30 hover:bg-muted/40 transition-colors">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Appointment Date</p>
              <p className="font-medium flex items-center gap-2 mt-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(guest.appointment_date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Parking Time</p>
              <p className="font-medium flex items-center gap-2 mt-1">
                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                {formatTimeRange(guest.parking_start_time, guest.parking_end_time)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Purpose of Visit</p>
              <p className="font-medium mt-1">{guest.purpose_of_visit || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="space-y-4 mt-6">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Car className="h-4 w-4" />
          Vehicle Information
        </h3>

        <div className="rounded-lg border p-4 bg-muted/30 hover:bg-muted/40 transition-colors">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Plate Number</p>
            <p className="font-medium mt-1">{guest.user_id.vehicle_plate_number || "Not provided"}</p>
          </div>
        </div>
      </div>
    </>
  );

  const ActionsUI = (
    <div className="flex justify-between items-center pt-6">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        Close
      </Button>

      {guest.status === "Open" && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isLoading}
            className="border-red-200 hover:bg-red-50 hover:text-red-800 text-red-700 dark:border-red-800/30 dark:hover:bg-red-950/20 dark:text-red-400"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
            Decline
          </Button>

          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="bg-primary/90 hover:bg-primary"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Approve
          </Button>
        </div>
      )}
    </div>
  );

  if (isDesktopUI) {
    return (
      <Dialog open={!!guest} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          {ModalUI}
          {ActionsUI}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={!!guest} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center">
            <span className="h-7 w-7 bg-zinc-900 rounded-full flex items-center justify-center mr-2">
              <QrCode className="h-4 w-4 text-white" />
            </span>
            <DrawerTitle className="text-xl">Guest Request Details</DrawerTitle>
          </div>
          <DrawerDescription className="text-zinc-500">
            Review the details of the guest request below.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto">
          {ModalUI}
        </div>

        <DrawerFooter className="pt-4">
          {ActionsUI}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}