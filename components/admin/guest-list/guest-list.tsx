"use client";

import { useState } from "react";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, Eye, ArrowRight, UserCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion } from "framer-motion";

export function GuestList() {
  const { guestList, error, loading } = useGuestListSubscription();
  const [selectedGuest, setSelectedGuest] = useState<GuestListType | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const pendingApprovals = guestList?.filter((guest) => guest.status === "Open") || [];

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

  if (loading) {
    return <GuestListLoading />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-800/20">
        <CardContent className="p-4 text-red-700 dark:text-red-400">
          Error loading guest list: {error.message}
        </CardContent>
      </Card>
    );
  }

  // Animation variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  // Mobile card view
  const MobileView = () => (
    <motion.div 
      className="space-y-4 max-w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {pendingApprovals.length > 0 ? (
        pendingApprovals.map((guest) => (
          <motion.div key={guest.id} variants={item}>
            <Card className="overflow-hidden border-border/40 hover:border-border hover:shadow-sm transition-all max-w-full">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {guest.user_id.first_name} {guest.user_id.last_name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {guest.user_id.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {guest.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm pt-1">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>{guest.appointment_date}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <ClockIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    {formatTimeRange(guest.parking_start_time, guest.parking_end_time)}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-0">
                <Button 
                  className="w-full rounded-none h-11 font-medium" 
                  variant="ghost"
                  onClick={() => setSelectedGuest(guest)}
                >
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="border-dashed max-w-full">
          <CardContent className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center">
            <UserCircle className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <p>No pending approvals</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  // Desktop table view
  const DesktopView = () => (
    <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden">
      <div className="rounded-md border-0 overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="w-[350px] py-3">Guest</TableHead>
              <TableHead className="py-3">Date & Time</TableHead>
              <TableHead className="py-3">Status</TableHead>
              <TableHead className="text-right py-3 pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((guest) => (
                <TableRow key={guest.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCircle className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {guest.user_id.first_name} {guest.user_id.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[240px]">
                          {guest.user_id.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                        <span>{guest.appointment_date}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                        {formatTimeRange(guest.parking_start_time, guest.parking_end_time)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {guest.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => setSelectedGuest(guest)} 
                      size="sm" 
                      variant="outline"
                      className="hover:bg-primary/5"
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UserCircle className="h-10 w-10 mb-2 text-muted-foreground/50" />
                    <p>No pending approvals</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-[950px]">
      {/* Conditionally render mobile or desktop view */}
      {isMobile ? <MobileView /> : <DesktopView />}

      <GuestModal
        guest={selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
}