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

export function GuestList() {
  const { guestList, error, loading } = useGuestListSubscription();
  const [selectedGuest, setSelectedGuest] = useState<GuestList | null>(null);

  if (loading) {
    return <GuestListLoading />;
  }

  if (error) {
    return <div>Error loading guest list: {error.message}</div>;
  }
  console.log(guestList);
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
          {guestList
            .filter((guest) => guest.status === "Open")
            .map((guest) => (
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
            ))}
        </TableBody>
      </Table>

      <GuestModal
        guest={selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
}
