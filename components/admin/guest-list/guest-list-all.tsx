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
import { GuestList } from "@/app/types/guest-list";

export function AllGuestList() {
  const { guestList, error, loading } = useGuestListSubscription(); 
  const [selectedGuest, setSelectedGuest] = useState<GuestList | null>(null);

  if (loading) {
    return <GuestListLoading />;
  }

  if (error) {
    return <div>Error loading guest list: {error.message}</div>;
  }

  return (
    <div className="container mx-auto">
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
            guestList.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell className="font-medium">
                  {guest.user_id.first_name} {guest.user_id.last_name}
                </TableCell>
                <TableCell>{guest.user_id.email}</TableCell>
                <TableCell>{guest.appointment_date}</TableCell>
                <TableCell>
                  {guest.parking_start_time} - {guest.parking_end_time}
                </TableCell>
                <TableCell>{guest.status}</TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedGuest(guest)}>View</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No approval history available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <GuestModal
        guest={selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
}
