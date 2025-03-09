"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitGuestParkingRequest } from "@/app/api/guest/actions";
import { Loader2 } from "lucide-react";

interface GenerateQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface QRCodeData {
  title: string;
  appointmentDate: Date;
  purpose: string;
  parkingTimeIn: string;
  parkingTimeOut: string;
}

export function GenerateQRCodeModal({
  isOpen,
  onClose,
}: GenerateQRCodeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await SubmitGuestParkingRequest(formData);
    } catch (error) {
      console.error("Error submitting parking request:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate New QR Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appointmentDate" className="text-right">
                Appointment Date
              </Label>
              <Input type="date" name="appointmentDate" id="appointmentDate" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose" className="text-right">
                Purpose of Visit
              </Label>
              <Input id="purpose" name="purpose" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parkingTimeIn" className="text-right">
                Parking Time In
              </Label>
              <Input
                id="parkingTimeIn"
                name="parkingTimeIn"
                type="time"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parkingTimeOut" className="text-right">
                Parking Time Out
              </Label>
              <Input
                id="parkingTimeOut"
                name="parkingTimeOut"
                type="time"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
