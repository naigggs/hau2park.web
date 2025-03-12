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
import type { GuestList as GuestListType } from "@/app/types/guest-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MailIcon, UserIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

export function GuestList() {
  const { guestList, error, loading } = useGuestListSubscription();
  const [selectedGuest, setSelectedGuest] = useState<GuestListType | null>(null);
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

  const pendingApprovals = guestList.filter((guest) => guest.status === "Open");

  // Mobile card view
  const MobileView = () => (
    <div className="space-y-4">
      {pendingApprovals.length > 0 ? (
        pendingApprovals.map((guest) => (
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
                  <Badge variant="outline" className="capitalize">
                    {guest.status}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm">
                  <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">{guest.user_id.email}</span>
                </div>
                
                <div className="flex items-center gap-x-4 text-sm">
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
        ))
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No pending approvals
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
        {pendingApprovals.length > 0 ? (
          pendingApprovals.map((guest) => (
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
                <Badge variant="outline" className="capitalize">
                  {guest.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button onClick={() => setSelectedGuest(guest)} size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
              No pending approvals
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