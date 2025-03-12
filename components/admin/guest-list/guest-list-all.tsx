"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GuestModal } from "./guest-modal";
import GuestListLoading from "@/components/shared/loading/guest-list";
import { useGuestListSubscription } from "@/hooks/use-guest-list-subscription";
import { GuestList } from "@/app/types/guest-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MailIcon, UserIcon } from "lucide-react";

// Define the valid badge variants based on your shadcn/ui Badge component
type BadgeVariant = "destructive" | "default" | "outline" | "secondary" | undefined;

export function AllGuestList() {
  const { guestList, error, loading } = useGuestListSubscription(); 
  const [selectedGuest, setSelectedGuest] = useState<GuestList | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on client-side before using window
    if (typeof window !== "undefined") {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Set initial value
      checkIsMobile();
      
      // Add event listener
      window.addEventListener("resize", checkIsMobile);
      
      // Clean up
      return () => window.removeEventListener("resize", checkIsMobile);
    }
  }, []);

  // Helper to get the right badge variant based on status
  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case 'approved':
        return "secondary"; // Using secondary for approved instead of success
      case 'rejected':
        return "destructive";
      case 'open':
        return "default";
      default:
        return "outline";
    }
  };

  // Helper to get color classes based on status (alternative to using badge variants)
  const getStatusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'approved':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'rejected':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case 'open':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "";
    }
  };

  if (loading) {
    return <GuestListLoading />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
        Error loading guest list: {error.message}
      </div>
    );
  }

  // Mobile card view
  const MobileView = () => (
    <div className="space-y-4">
      {guestList && guestList.length > 0 ? (
        guestList.map((guest) => {
          // Get badge variant and custom classes for status
          const badgeVariant = getStatusBadgeVariant(guest.status);
          const statusClasses = getStatusClasses(guest.status);
          
          return (
            <Card key={guest.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">
                        {guest.user_id.first_name} {guest.user_id.last_name}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${statusClasses}`}>
                      {guest.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">{guest.user_id.email}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-4 text-sm">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{guest.appointment_date}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {guest.parking_start_time} - {guest.parking_end_time}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50">
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedGuest(guest)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No approval history available
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Desktop table view
  const DesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Appointment Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {guestList && guestList.length > 0 ? (
          guestList.map((guest) => {
            // Get custom classes for status
            const statusClasses = getStatusClasses(guest.status);
            
            return (
              <TableRow key={guest.id}>
                <TableCell className="font-medium">
                  {guest.user_id.first_name} {guest.user_id.last_name}
                </TableCell>
                <TableCell>{guest.user_id.email}</TableCell>
                <TableCell>{guest.appointment_date}</TableCell>
                <TableCell>
                  {guest.parking_start_time} - {guest.parking_end_time}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${statusClasses}`}>
                    {guest.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedGuest(guest)} size="sm">View</Button>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
              No approval history available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="w-full">
      {/* Conditionally render mobile or desktop view */}
      <div className="md:hidden">
        <MobileView />
      </div>
      <div className="hidden md:block">
        <DesktopView />
      </div>

      <GuestModal
        guest={selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
}