"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function SubmitGuestParkingRequest(formData: FormData) {
  const supabase = await createClient();
  const headersList = await headers();
  const userId = headersList.get("user_id");

  if (!userId) {
    throw new Error("User not authenticated. Please log in and try again.");
  }

  const data = {
    title: formData.get("title") as string,
    purpose: formData.get("purpose") as string,
    appointmentDate: formData.get("appointmentDate") as string,
    parkingTimeIn: formData.get("parkingTimeIn") as string,
    parkingTimeOut: formData.get("parkingTimeOut") as string,
  }

  // Check for empty required fields
  if (!data.title.trim() || !data.purpose.trim() || !data.appointmentDate || 
      !data.parkingTimeIn || !data.parkingTimeOut) {
    throw new Error("Please fill in all required fields");
  }

  // Check for existing request with same date and time
  const { data: existingRequests, error: checkError } = await supabase
    .from("guest_parking_request")
    .select("id")
    .eq("user_id", userId)
    .eq("appointment_date", data.appointmentDate)
    .eq("parking_start_time", data.parkingTimeIn)
    .eq("status", "Open");

  if (checkError) {
    console.error("Error checking existing requests:", checkError);
    throw new Error("Failed to process your request. Please try again.");
  }

  if (existingRequests && existingRequests.length > 0) {
    throw new Error("You already have a pending parking request for this date and time.");
  }

  const { error: requestError } = await supabase
    .from("guest_parking_request")
    .insert({
      user_id: userId,
      title: data.title,
      appointment_date: data.appointmentDate,
      purpose_of_visit: data.purpose,
      parking_start_time: data.parkingTimeIn,
      parking_end_time: data.parkingTimeOut,
      status: "Open",
      secret_key: generateRandomKey(), // Generate a random key for the QR code
    });

  if (requestError) {
    console.error("Guest Request Error:", requestError);
    
    if (requestError.code === "23505") { // Unique constraint violation
      throw new Error("You already have a pending request with this information.");
    }
    
    throw new Error("Failed to submit request. Please try again later.");
  }

  revalidatePath("/guest/qr-code", "layout");
  return { success: true }; // Return success instead of redirecting
}

// Helper function to generate a random key for the QR code
function generateRandomKey(length = 12) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}