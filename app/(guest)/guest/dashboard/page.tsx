"use client";

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useUserInfo } from "@/hooks/use-user-info";
import { useGuestParkingRequests } from "@/hooks/use-guest-parking-requests";
import { useGuestQRCodeList } from "@/hooks/use-guest-qr";
import { useParkingSpaces } from "@/hooks/use-parking-space";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  MapPin,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Bell,
  FileText,
} from "lucide-react";
import { format, isAfter, differenceInMinutes, parseISO, isBefore, isEqual } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRouter } from "next/navigation";

export default function GuestDashboard() {
  const { user, isLoading: userLoading } = useUserInfo();
  const { requests, isLoading: requestsLoading } = useGuestParkingRequests();
  const { guestQRList, loading: qrLoading, refresh: refreshQRCodes } = useGuestQRCodeList();
  const { parkingSpaces, isLoading: spacesLoading } = useParkingSpaces();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const router = useRouter();
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  
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

  // Format current date and time - more subtle formatting
  const currentDate = format(now, "EEE, MMM d");
  const currentTime = format(now, "h:mm a");
  
  // Get user ID from user info
  const userId = user?.user_id;
  
  // Find latest approved request by matching user_id - case insensitive check for "Approved"
  const latestApprovedRequest = React.useMemo(() => {
    if (!requests || !requests.length || !userId) return null;
    
    // Filter requests to only include this user's approved requests
    const approvedRequests = requests.filter(req => 
      req.status.toLowerCase() === "approved" // case-insensitive check
    );
    
    if (approvedRequests.length === 0) return null;
    
    // Sort by appointment_date (latest first), then by created_at (latest first)
    return [...approvedRequests].sort((a, b) => {
      // First compare by appointment_date
      const dateA = new Date(a.appointment_date);
      const dateB = new Date(b.appointment_date);
      
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // If dates are the same, compare by created_at
      const createdA = new Date(a.created_at);
      const createdB = new Date(b.created_at);
      return createdB.getTime() - createdA.getTime();
    })[0]; // Get the first item (most recent)
  }, [requests, userId]);
  
  // Find if guest has an assigned parking space
  const userFullName = user ? `${user.first_name} ${user.last_name}` : "";
  const assignedSpace = parkingSpaces?.find(space => 
    typeof space.user === 'string' 
      ? space.user.toLowerCase() === userFullName.toLowerCase()
      : false
  );
  
  // Find active QR code
  const activeQR = React.useMemo(() => {
    if (!guestQRList || !guestQRList.length || !userId) return null;
    
    return guestQRList.find(qr => {
      // Match user_id
      if (String(qr.user_id) !== String(userId)) return false;
      
      // We want either active unused QR codes or active used ones
      if (qr.status !== 'Expired' && !qr.is_used) return true;
      if ((qr.status === 'active' || qr.status === 'Open') && qr.is_used) return true;
      
      return false;
    });
  }, [guestQRList, userId]);
  
  // Format parking time
  const formatParkingTime = (timeString?: string | null): string => {
    if (!timeString) return 'N/A';
    
    try {
      return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString;
    }
  };
  
  // Get parking end time directly from latest approved request
  const parkingEndTime = formatParkingTime(latestApprovedRequest?.parking_end_time);
  const parkingStartTime = formatParkingTime(latestApprovedRequest?.parking_start_time);
  
  // Improved check for parking expiration - considers both date and time components
  const isParkingExpired = () => {
    if (!latestApprovedRequest || !assignedSpace) return false;
    
    try {
      // Get current date/time components
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // Parse appointment date
      const appointmentDate = new Date(latestApprovedRequest.appointment_date);
      const appointmentYear = appointmentDate.getFullYear();
      const appointmentMonth = appointmentDate.getMonth();
      const appointmentDay = appointmentDate.getDate();
      
      // Parse end time
      const [endHours, endMinutes] = latestApprovedRequest.parking_end_time.split(':').map(Number);
      
      // Create date objects for comparison
      const appointmentEndDateTime = new Date(
        appointmentYear, appointmentMonth, appointmentDay, 
        endHours, endMinutes, 0
      );
      
      const currentDateTime = new Date(
        currentYear, currentMonth, currentDay,
        currentHours, currentMinutes, 0
      );
      
      // If current date/time is after the appointment end date/time, parking is expired
      return currentDateTime > appointmentEndDateTime;
    } catch (e) {
      console.error("Error checking parking expiration:", e);
      return false;
    }
  };
  
  // Calculate remaining time for parking
  const getRemainingTime = () => {
    if (!latestApprovedRequest || !assignedSpace) return null;
    
    try {
      // Parse appointment date and end time
      const appointmentDate = new Date(latestApprovedRequest.appointment_date);
      const [hours, minutes, seconds] = latestApprovedRequest.parking_end_time.split(':').map(Number);
      
      // Set hours, minutes, seconds on the appointment date
      appointmentDate.setHours(hours, minutes, seconds);
      
      if (isAfter(appointmentDate, now)) {
        const minutesLeft = differenceInMinutes(appointmentDate, now);
        const hoursLeft = Math.floor(minutesLeft / 60);
        const minsLeft = minutesLeft % 60;
        
        if (hoursLeft > 0) {
          return `${hoursLeft}h ${minsLeft}m remaining`;
        } else {
          return `${minsLeft}m remaining`;
        }
      }
      return "Time expired";
    } catch (e) {
      console.error("Error calculating remaining time:", e);
      return null;
    }
  };
  
  // Updated parking status logic - now with improved date checking
  const parkingStatus = React.useMemo(() => {
    if (!assignedSpace) return "not-parked";
    
    if (isParkingExpired()) {
      return "illegal-parking";
    }
    
    return assignedSpace.verified_by_user ? "parked" : "looking";
  }, [assignedSpace, isParkingExpired]);

  // Download QR code function
  const downloadQRCode = () => {
    if (!activeQR?.qr_code_url) return;
    
    try {
      const link = document.createElement('a');
      link.href = activeQR.qr_code_url;
      link.download = 'guest-parking-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR Code Downloaded",
        description: "Your parking QR code has been downloaded successfully.",
      });
    } catch (e) {
      console.error('Error downloading QR code:', e);
    }
  };

  // Share QR code function
  const shareQRCode = async () => {
    if (!activeQR?.qr_code_url || typeof navigator === 'undefined' || !navigator.share) return;
    
    try {
      await navigator.share({
        title: 'My Guest Parking QR Code',
        text: 'Here is my QR code for guest parking at HAU2Park',
        url: activeQR.qr_code_url,
      });
    } catch (e) {
      console.error('Error sharing:', e);
      toast({
        title: "Sharing Failed",
        description: "There was an error sharing your QR code.",
        variant: "destructive"
      });
    }
  };
  
  // Handle request button click
  const handleRequestClick = () => {
    router.push('/guest/qr-code');
  };
  
  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshQRCodes();
    setTimeout(() => setRefreshing(false), 800);
    
    toast({
      title: "Dashboard Refreshed",
      description: "Your dashboard information has been updated."
    });
  };

  const isLoading = userLoading || requestsLoading || qrLoading || spacesLoading;

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen bg-white/80 dark:bg-slate-900">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text">
              {greeting}
              {userLoading ? "" : user ? `, ${user.first_name}` : ""}
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <span className="flex items-center">
                <Calendar className="mr-1 h-3.5 w-3.5 text-blue-500" />
                {currentDate}
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/30"></span>
              <span className="flex items-center">
                <Clock className="mr-1 h-3.5 w-3.5 text-orange-500" />
                {currentTime}
              </span>
              {!userLoading && user && (
                <>
                  <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                  <span className="flex items-center">
                    <User className="mr-1 h-3.5 w-3.5" />
                    Guest
                  </span>
                </>
              )}
            </div>
          </div>
          
          {!isMobile && (
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-4 md:mt-0 border-blue-200 dark:border-blue-800"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn(
                "mr-2 h-4 w-4", 
                refreshing && "animate-spin"
              )} />
              Refresh
            </Button>
          )}
        </div>
      </header>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-6 w-full md:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Parking Status Card - Moved to the top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={cn(
                "overflow-hidden shadow-sm",
                parkingStatus === 'illegal-parking' ? 'border-destructive' : 
                parkingStatus === 'parked' ? 'border-green-200 dark:border-green-800' : ''
              )}>
                <CardHeader className="pb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Car className={cn(
                        "h-5 w-5",
                        parkingStatus === 'illegal-parking' ? 'text-destructive' :
                        parkingStatus === 'parked' ? 'text-green-500' :
                        parkingStatus === 'looking' ? 'text-blue-500' :
                        'text-primary'
                      )} />
                      Parking Status
                    </CardTitle>
                    {assignedSpace && (
                      <Badge 
                        variant={
                          parkingStatus === 'parked' ? 'success' : 
                          parkingStatus === 'illegal-parking' ? 'destructive' : 
                          parkingStatus === 'looking' ? 'default' : 
                          'outline'
                        }
                        className="capitalize font-medium"
                      >
                        {parkingStatus === 'illegal-parking' ? 'Illegally Parked' : 
                         parkingStatus === 'parked' ? 'Parked' : 
                         parkingStatus === 'looking' ? 'Arriving' : 'Not Parked'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center">
                    {isLoading ? (
                      <Skeleton className="h-4 w-[150px]" />
                    ) : user && user.vehicle_plate_number ? (
                      <>
                        <span className="font-medium mr-1">Vehicle:</span> {user.vehicle_plate_number}
                      </>
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
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  ) : assignedSpace ? (
                    <div className="space-y-4">
                      <Collapsible
                        open={isDetailsOpen}
                        onOpenChange={setIsDetailsOpen}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center justify-center">
                            <div className="text-muted-foreground text-xs mb-1">Parking Spot</div>
                            <div className="font-semibold flex items-center text-sm">
                              <MapPin className="mr-1 h-4 w-4 text-blue-500" />
                              {assignedSpace.name}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center justify-center">
                            <div className="text-muted-foreground text-xs mb-1">Location</div>
                            <div className="font-semibold text-sm">
                              {assignedSpace.location}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col">
                            <div className="text-muted-foreground text-xs mb-1">Time In</div>
                            <div className="font-semibold flex items-center text-sm">
                              <Clock className="mr-1 h-4 w-4 text-blue-500" />
                              {parkingStartTime}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex flex-col">
                            <div className="text-muted-foreground text-xs mb-1">Time Out</div>
                            <div className="font-semibold flex items-center text-sm">
                              <Clock className="mr-1 h-4 w-4 text-orange-500" />
                              {parkingEndTime}
                            </div>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          {parkingStatus === 'illegal-parking' ? (
                            <div className="mt-2 p-3 bg-destructive/5 border border-destructive/50 rounded-md flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                              <span className="text-sm font-medium text-destructive">
                                Your parking time has expired. Please return to your vehicle immediately.
                              </span>
                            </div>
                          ) : !isParkingExpired() && parkingStatus !== 'not-parked' && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">Parking Time Remaining</span>
                                <span className="text-xs font-medium">{getRemainingTime()}</span>
                              </div>
                              <Progress 
                                value={latestApprovedRequest ? 
                                  Math.max(
                                    0, 
                                    differenceInMinutes(
                                      new Date(`${latestApprovedRequest.appointment_date}T${latestApprovedRequest.parking_end_time}`), 
                                      now
                                    ) / 
                                    differenceInMinutes(
                                      new Date(`${latestApprovedRequest.appointment_date}T${latestApprovedRequest.parking_end_time}`), 
                                      new Date(`${latestApprovedRequest.appointment_date}T${latestApprovedRequest.parking_start_time}`)
                                    ) * 100
                                  ) : 0
                                }
                                className="h-2 bg-gray-100 dark:bg-gray-800"
                              />
                            </div>
                          )}
                        </CollapsibleContent>
                        
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full flex items-center justify-center mt-2">
                            {isDetailsOpen ? (
                              <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
                            ) : (
                              <>Show More <ChevronDown className="ml-1 h-4 w-4" /></>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-6 mb-4">
                        <Car className="h-10 w-10 text-gray-500" />
                      </div>
                      <h3 className="font-medium text-lg mb-1">Not Currently Parked</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Request a parking space to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Active QR Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="overflow-hidden shadow-sm">
                <CardHeader className="pb-3 space-y-1.5">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-500" />
                    Active QR Code
                  </CardTitle>
                  <CardDescription>
                    Show this to the parking attendant
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="h-64 w-64 rounded-lg" />
                  ) : activeQR ? (
                    <div className="flex flex-col items-center">
                      <div className="h-64 w-64 bg-white p-4 rounded-lg shadow-sm border border-blue-200 dark:border-blue-900 flex items-center justify-center overflow-hidden">
                        {activeQR.qr_code_url && (
                          <img 
                            src={activeQR.qr_code_url}
                            alt="Parking QR Code" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={downloadQRCode}
                                className="flex items-center gap-1 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Download className="h-4 w-4 text-blue-500" />
                                Download
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download QR Code</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={shareQRCode}
                                  className="flex items-center gap-1 border-orange-200 dark:border-orange-900 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                >
                                  <Share2 className="h-4 w-4 text-orange-500" />
                                  Share
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Share QR Code</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                        <QrCode className="h-12 w-12 text-gray-500" />
                      </div>
                      <h3 className="font-medium text-lg mb-1">No Active QR Code</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Submit a parking request to get your QR code for entry
                      </p>
                      {/* Call to action button */}
                      <Button 
                        className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        size="sm"
                        onClick={handleRequestClick}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Request Parking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Visit Details */}
            {latestApprovedRequest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="overflow-hidden shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <CalendarClock className="h-5 w-5 text-orange-500" />
                      Visit Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Appointment Date</h3>
                        <p className="font-medium flex items-center">
                          <Calendar className="mr-1.5 h-4 w-4 text-orange-500" />
                          {format(new Date(latestApprovedRequest.appointment_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Reservation Time</h3>
                        <p className="font-medium flex items-center">
                          <Clock className="mr-1.5 h-4 w-4 text-blue-500" />
                          {parkingStartTime} - {parkingEndTime}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Purpose of Visit</h3>
                        <p className="font-medium flex items-center">
                        <FileText className="mr-1.5 h-4 w-4" />
                        {latestApprovedRequest?.purpose_of_visit?.substring(0, 50) || 'N/A'}
                        {(latestApprovedRequest?.purpose_of_visit?.length ?? 0) > 50 ? '...' : ''}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                        <p className="font-medium flex items-center">
                          <Badge 
                            variant={latestApprovedRequest.status.toLowerCase() === 'approved' ? 'success' : 'outline'}
                            className="capitalize"
                          >
                            {latestApprovedRequest.status}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <History className="h-5 w-5 text-orange-500" />
                Request History
              </CardTitle>
              <CardDescription>Your previous parking requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
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
                  {requests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{request.title || "Parking Request"}</h3>
                        <Badge variant={
                          request.status.toLowerCase() === 'approved' ? 'success' :
                          request.status.toLowerCase() === 'rejected' ? 'destructive' :
                          request.status.toLowerCase() === 'active' ? 'default' : 'outline'
                        } className="capitalize">
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {request.purpose_of_visit}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-muted-foreground gap-2 sm:gap-0">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-blue-500" />
                          {format(new Date(request.appointment_date), 'MMMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-orange-500" />
                          {format(new Date(`2000-01-01T${request.parking_start_time}`), 'h:mm a')} - 
                          {format(new Date(`2000-01-01T${request.parking_end_time}`), 'h:mm a')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-6 mb-4">
                    <History className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">No Request History</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    You haven't made any parking requests yet. Create a new request to get started.
                  </p>
                  {/* Call to action button */}
                  <Button 
                    className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    size="sm"
                    onClick={handleRequestClick}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Create Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile bottom navigation - only visible on mobile, now more subtle */}
      {isMobile && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-md">
            <div className="flex justify-around">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab("overview")} 
                className={cn(
                  "flex flex-col items-center gap-0.5 h-auto py-1.5 px-3",
                  activeTab === "overview" && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                )}
              >
                <Home className="h-4 w-4" />
                <span className="text-[10px]">Overview</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab("history")} 
                className={cn(
                  "flex flex-col items-center gap-0.5 h-auto py-1.5 px-3",
                  activeTab === "history" && "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                )}
              >
                <History className="h-4 w-4" />
                <span className="text-[10px]">History</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-3"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                <span className="text-[10px]">Refresh</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRequestClick} 
                className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-3"
              >
                <Bell className="h-4 w-4" />
                <span className="text-[10px]">Request</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}