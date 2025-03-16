"use client";

import React, { useState, useEffect } from 'react';
import { useUserInfo } from "@/hooks/use-user-info";
import { useGuestParkingRequests } from "@/hooks/use-guest-parking-requests";
import { useGuestQRCodeList } from "@/hooks/use-guest-qr";
import { useParkingSpaces } from "@/hooks/use-parking-space";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Car,
  Clock,
  CalendarClock,
  History,
  QrCode,
  RefreshCw,
  X,
  Home,
  Share2,
  Download,
  MapPin
} from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function GuestDashboard() {
  const { user, isLoading: userLoading } = useUserInfo();
  const { requests, isLoading: requestsLoading } = useGuestParkingRequests();
  const { guestQRList, loading: qrLoading } = useGuestQRCodeList();
  const { parkingSpaces, isLoading: spacesLoading } = useParkingSpaces();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get current time for greeting and status checks
  const now = new Date();
  const hours = now.getHours();
  let greeting;
  if (hours < 12) {
    greeting = "Good Morning";
  } else if (hours < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  // Format current date and time
  const currentDate = format(now, "EEEE, MMMM d, yyyy");
  const currentTime = format(now, "HH:mm:ss");
  
  // Find latest active guest request (for current parking status)
  const activeRequest = requests && requests.length > 0 
    ? requests.find(req => req.status === "approved" || req.status === "active")
    : null;
  
  // Find if guest has an assigned parking space
  const userFullName = user ? `${user.first_name} ${user.last_name}` : "";
  const assignedSpace = parkingSpaces?.find(space => 
    space.user?.toLowerCase() === userFullName.toLowerCase()
  );
  
  // Find active QR code
  const activeQR = guestQRList && guestQRList.length > 0 
    ? guestQRList.find(qr => !qr.is_used && qr.status === "active")
    : null;
  
  // Check if parking has expired (illegal parking status)
  const isParkingExpired = () => {
    if (!activeRequest || !assignedSpace) return false;
    
    try {
      // Convert end time string to Date object for comparison
      // Typically the format would be "HH:mm:ss" for time fields
      const appointmentDate = activeRequest.appointment_date;
      const endTimeStr = activeRequest.parking_end_time;
      
      // Create a date object with the appointment date and end time
      const [hours, minutes, seconds] = endTimeStr.split(':').map(Number);
      const endTime = new Date(appointmentDate);
      endTime.setHours(hours, minutes, seconds);
      
      // Compare with current time
      return isAfter(now, endTime);
    } catch (e) {
      console.error("Error parsing dates:", e);
      return false;
    }
  };
  
  const parkingStatus = assignedSpace 
    ? isParkingExpired() 
      ? "illegal-parking"
      : assignedSpace.verified_by_user 
        ? "parked" 
        : "looking"
    : "not-parked";

  // Download QR code function
  const downloadQRCode = () => {
    if (!activeQR?.qr_code_url) return;
    
    const link = document.createElement('a');
    link.href = activeQR.qr_code_url;
    link.download = 'guest-parking-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share QR code function
  const shareQRCode = async () => {
    if (!activeQR?.qr_code_url || !navigator.share) return;
    
    try {
      await navigator.share({
        title: 'My Guest Parking QR Code',
        text: 'Here is my QR code for guest parking at HAU2Park',
        url: activeQR.qr_code_url,
      });
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };
  
  const isLoading = userLoading || requestsLoading || qrLoading || spacesLoading;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}
            {userLoading ? "" : user ? `, ${user.first_name}` : ""}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-muted-foreground">
            <p>{currentDate}</p>
            <div className="hidden sm:block text-xs">•</div>
            <p className="text-sm">
              Current Time (UTC): {currentTime}
            </p>
          </div>
          {!userLoading && user && (
            <p className="text-sm text-muted-foreground">
              Guest Account
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Request History</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active QR Code */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Active QR Code
                </CardTitle>
                <CardDescription>
                  Show this to the parking attendant
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {isLoading ? (
                  <Skeleton className="h-64 w-64" />
                ) : activeQR ? (
                  <div className="flex flex-col items-center">
                    <div className="relative h-64 w-64 bg-white p-4 rounded-lg shadow-sm">
                      <Image 
                        src={activeQR.qr_code_url} 
                        alt="Parking QR Code" 
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={downloadQRCode}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      {typeof navigator.share === 'function' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={shareQRCode}
                          className="flex items-center gap-1"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <QrCode className="h-16 w-16 text-muted-foreground/40 mb-3" />
                    <p className="font-medium">No Active QR Code</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submit a parking request to get your QR code
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parking Status */}
            <Card className={`${parkingStatus === 'illegal-parking' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Parking Status
                  </CardTitle>
                  {assignedSpace && (
                    <Badge 
                      variant={
                        parkingStatus === 'parked' ? 'success' : 
                        parkingStatus === 'illegal-parking' ? 'destructive' : 
                        'default'
                      }
                    >
                      {parkingStatus === 'illegal-parking' ? 'Time Expired' : 
                       parkingStatus === 'parked' ? 'Parked' : 
                       parkingStatus === 'looking' ? 'Arriving' : 'Not Parked'}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[150px]" />
                  ) : user && user.vehicle_plate_number ? (
                    `Vehicle: ${user.vehicle_plate_number}`
                  ) : (
                    "No vehicle registered"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ) : assignedSpace ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Parking Spot:</span>
                      <span className="font-medium">
                        {`${assignedSpace.name} - ${assignedSpace.location}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time In:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        {assignedSpace.allocated_at ? format(new Date(assignedSpace.allocated_at), 'hh:mm a') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time Out:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        {activeRequest?.parking_end_time ? 
                          format(new Date(`2000-01-01T${activeRequest.parking_end_time}`), 'hh:mm a') : 'N/A'}
                      </span>
                    </div>
                    
                    {parkingStatus === 'illegal-parking' && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <span className="text-sm font-medium text-destructive">
                          Your parking time has expired. Please return to your vehicle.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Car className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      You are not currently parked
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visit Details */}
          {activeRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Visit Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Purpose of Visit</h3>
                    <p className="mt-1 text-muted-foreground">{activeRequest.purpose_of_visit}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Appointment Date</h3>
                    <p className="mt-1 text-muted-foreground">{format(new Date(activeRequest.appointment_date), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Start Time</h3>
                    <p className="mt-1 text-muted-foreground">
                      {format(new Date(`2000-01-01T${activeRequest.parking_start_time}`), 'hh:mm a')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">End Time</h3>
                    <p className="mt-1 text-muted-foreground">
                      {format(new Date(`2000-01-01T${activeRequest.parking_end_time}`), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Request History
              </CardTitle>
              <CardDescription>Your previous parking requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{request.title}</h3>
                        <Badge variant={
                          request.status === 'approved' ? 'success' :
                          request.status === 'rejected' ? 'destructive' :
                          request.status === 'active' ? 'default' : 'outline'
                        }>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {request.purpose_of_visit}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>
                          {format(new Date(request.appointment_date), 'MMMM d, yyyy')}
                          {' • '}
                          {format(new Date(`2000-01-01T${request.parking_start_time}`), 'hh:mm a')} - 
                          {format(new Date(`2000-01-01T${request.parking_end_time}`), 'hh:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-xl font-medium">No request history</p>
                  <p className="text-muted-foreground mt-1">
                    You haven't made any parking requests yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}