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
    throw new Error("User not authenticated");
  }

  const data = {
    title: formData.get("title") as string,
    purpose: formData.get("purpose") as string,
    appointmentDate: formData.get("appointmentDate") as string,
    parkingTimeIn: formData.get("parkingTimeIn") as string,
    parkingTimeOut: formData.get("parkingTimeOut") as string,
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
    });

  if (requestError) {
    console.log("Guest Request Error", requestError);
    throw new Error("Failed to submit request");
  }

  revalidatePath("/guest/qr-code", "layout");
  redirect("/guest/qr-code");
}
