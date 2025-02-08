"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

interface GuestParkingRequestData {
  userId: string;
  title: string;
  purpose: string;
  appointmentDate: string;
  parkingTimeIn: string;
  parkingTimeOut: string;
  currentUser?: string;
  timestamp?: string;
}

export async function SubmitGuestParkingRequest(formData: FormData) {
  const supabase = await createClient();
  
  const currentUser = formData.get("currentUser") as string || "Guest";
  const timestamp = formData.get("timestamp") as string || new Date().toISOString();
  
  const data: GuestParkingRequestData = {
    userId: formData.get("userId") as string,
    title: formData.get("title") as string,
    purpose: formData.get("purpose") as string,
    appointmentDate: formData.get("appointmentDate") as string,
    parkingTimeIn: formData.get("parkingTimeIn") as string,
    parkingTimeOut: formData.get("parkingTimeOut") as string,
    currentUser,
    timestamp,
  };

  const { error: requestError } = await supabase
    .from("guest_parking_request")
    .insert({
      user_id: data.userId,
      title: data.title,
      appointment_date: data.appointmentDate,
      purpose_of_visit: data.purpose,
      parking_start_time: data.parkingTimeIn,
      parking_end_time: data.parkingTimeOut,
      status: "Open",
      created_by: data.currentUser,
      created_at: data.timestamp,
    });

  if (requestError) {
    console.log("Guest Request Error", requestError);
    throw new Error("Failed to submit request");
  }

  revalidatePath("/guest/qr-code", "layout");
  redirect("/guest/qr-code");
}