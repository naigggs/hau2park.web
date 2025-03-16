import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const supabase = await createClient();
  const userId = req.headers.get("user_id");
  
  try {
    const body = await req.json();
    
    // Update user info in the database
    const { error: userInfoError } = await supabase
      .from("user_info")
      .update({
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.phone,
        vehicle_plate_number: body.vehicle_plate_number,
      })
      .eq("user_id", userId);

    if (userInfoError) {
      return new Response(JSON.stringify({ error: userInfoError.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}