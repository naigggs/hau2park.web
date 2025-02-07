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

interface GuestModalProps {
  guest: GuestList | null;
  onClose: () => void;
}

export function GuestModal({ guest, onClose }: Readonly<GuestModalProps>) {
  if (!guest) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const handleAccept = async () => {
    if (guest) {
      try {
        await updateVisitorApprovalStatus(guest.id, "Approved", guest.user_id.email, guest.user_id.user_id);
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
        await updateVisitorApprovalStatus(guest.id, "Declined", guest.user_id.email, guest.user_id.user_id);
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

  const { toast } = useToast();

  return (
    <Dialog open={!!guest} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{guest.user_id.first_name} {guest.user_id.last_name}</DialogTitle>
          <DialogDescription>Guest Details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="ID" value={guest.id.toString()} />
            <InfoItem label="Title" value={guest.title} />
            <InfoItem label="Email" value={guest.user_id.email} />
            <InfoItem
              label="Appointment Date"
              value={formatDate(guest.appointment_date)}
            />
            <InfoItem label="Purpose of Visit" value={guest.purpose_of_visit} />
            <InfoItem
              label="Vehicle Plate Number"
              value={guest.user_id.vehicle_plate_number || "N/A"}
            />
            <InfoItem
              label="Parking Start Time"
              value={guest.parking_start_time}
            />
            <InfoItem label="Parking End Time" value={guest.parking_end_time} />
            <InfoItem label="Status" value={guest.status} />
            <InfoItem label="Created At" value={formatDate(guest.created_at)} />
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <Button onClick={onClose} variant={"outline"}>
              Close
            </Button>
          </div>
          {guest.status === "Open" && (
            <div className="flex justify-end gap-x-2">
              <Button onClick={handleAccept}>Accept</Button>
              <Button onClick={handleDecline} variant={"destructive"}>
                Decline
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
