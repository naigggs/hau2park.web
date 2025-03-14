"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitGuestParkingRequest } from "@/app/api/guest/actions";
import { Loader2, Calendar, Clock, ClipboardList, Info, CalendarCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface GenerateQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
  onSuccess,
}: GenerateQRCodeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    appointmentDate: "",
    purpose: "",
    parkingTimeIn: "",
    parkingTimeOut: "",
  });

  // Set today's date as the minimum date
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.appointmentDate) {
      errors.appointmentDate = "Appointment date is required";
    }
    
    if (!formData.purpose.trim()) {
      errors.purpose = "Purpose of visit is required";
    }
    
    if (!formData.parkingTimeIn) {
      errors.parkingTimeIn = "Start time is required";
    }
    
    if (!formData.parkingTimeOut) {
      errors.parkingTimeOut = "End time is required";
    } else if (formData.parkingTimeIn && formData.parkingTimeOut <= formData.parkingTimeIn) {
      errors.parkingTimeOut = "End time must be after start time";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      appointmentDate: "",
      purpose: "",
      parkingTimeIn: "",
      parkingTimeOut: "",
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });
    
    try {
      await SubmitGuestParkingRequest(formDataObj);
      
      toast({
        title: "Request Submitted",
        description: "Your parking request has been submitted successfully.",
        className: "bg-green-500 text-white",
        duration: 5000,
      });
      
      resetForm();
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error submitting parking request:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error instanceof Error 
          ? error.message 
          : "There was a problem submitting your parking request. Please try again.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] overflow-hidden p-0">
        <div className="p-6 pb-0">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl flex items-center">
              <span className="h-7 w-7 bg-zinc-900 rounded-full flex items-center justify-center mr-2">
                <CalendarCheck className="h-4 w-4 text-white" />
              </span>
              Parking Request
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Fill in the details below to submit your parking request.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium flex items-center">
                  Request Title <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Enter a title for your parking request"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(
                    "bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-400",
                    formErrors.title && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate" className="text-sm font-medium flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                    Appointment Date <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    type="date" 
                    name="appointmentDate" 
                    id="appointmentDate"
                    min={today}
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className={cn(
                      "bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-400",
                      formErrors.appointmentDate && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {formErrors.appointmentDate && <p className="text-xs text-red-500 mt-1">{formErrors.appointmentDate}</p>}
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="parkingTimeIn" className="text-sm font-medium flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                    Start Time <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="parkingTimeIn"
                    name="parkingTimeIn"
                    type="time"
                    value={formData.parkingTimeIn}
                    onChange={handleChange}
                    className={cn(
                      "bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-400",
                      formErrors.parkingTimeIn && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {formErrors.parkingTimeIn && <p className="text-xs text-red-500 mt-1">{formErrors.parkingTimeIn}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parkingTimeOut" className="text-sm font-medium flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                  End Time <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="parkingTimeOut"
                  name="parkingTimeOut"
                  type="time"
                  value={formData.parkingTimeOut}
                  onChange={handleChange}
                  className={cn(
                    "bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-400",
                    formErrors.parkingTimeOut && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {formErrors.parkingTimeOut && <p className="text-xs text-red-500 mt-1">{formErrors.parkingTimeOut}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-sm font-medium flex items-center">
                  <ClipboardList className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                  Purpose of Visit <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea 
                  id="purpose" 
                  name="purpose" 
                  placeholder="Briefly describe the purpose of your visit"
                  value={formData.purpose}
                  onChange={handleChange}
                  className={cn(
                    "min-h-[80px] resize-none bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-400",
                    formErrors.purpose && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {formErrors.purpose && <p className="text-xs text-red-500 mt-1">{formErrors.purpose}</p>}
              </div>
            </div>
            
            <div className="bg-zinc-50 px-6 py-4 mt-6 rounded-b-lg border-t border-zinc-100 flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
              <div className="flex items-start text-xs text-zinc-500">
                <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>Requests are typically processed within 1-2 hours.</span>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={loading}
                  className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 sm:flex-none min-w-[100px] bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}