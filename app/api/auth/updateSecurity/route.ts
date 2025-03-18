import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();
    const supabase = await createClient();

    // First verify the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      email: email,
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Security settings updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating security settings:", error);
    return NextResponse.json(
      { message: "Failed to update security settings" },
      { status: 500 }
    );
  }
}