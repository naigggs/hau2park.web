"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function Login(formData: FormData) {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    throw new Error(error.message);
  }

  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .single();

  if (roleError) {
    throw new Error("Error fetching user role. Please try again.");
  }

  revalidatePath("/", "layout");

  if (roleData.role === "Admin") {
    redirect("/admin/dashboard");
  } else if (roleData.role === "Staff") {
    redirect("/staff/dashboard");
  } else if (roleData.role === "User") {
    redirect("/user/dashboard");
  } else if (roleData.role === "Guest") {
    redirect("/guest/dashboard");
  }
}

export async function GuestSignUp(formData: FormData) {
  const supabase = await createClient();
  
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    vehiclePlateNumber: formData.get("vehiclePlateNumber") as string,
    phone: formData.get("phone") as string,
  };

  const { data: guestData, error } = await supabase.auth.signUp(data);

  if (error) {
    console.log("Guest Sign Up", error);
    throw new Error(error.message);
  }

  const { error: roleError } = await supabase.from("user_roles").insert([
    {
      user_id: guestData?.user?.id ?? null,
      role: "Guest",
    },
  ]);

  if (roleError) {
    console.log("Guest Role Error", roleError);
  }

  const { error: profileError } = await supabase.from("user_info").insert({
    user_id: guestData?.user?.id ?? null,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    vehicle_plate_number: data.vehiclePlateNumber,
    phone: data.phone,
  });

  if (profileError) {
    console.log("Guest Profile Error", profileError);
  }

  revalidatePath("/guest/qr-code", "layout");
  // Redirect with a query param to indicate new registration
  redirect("/guest/qr-code?newRegistration=true");
}

export async function registerUser(formData: FormData) {
  const supabase = await createClient();

  // Get form data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const vehiclePlateNumber = formData.get("vehicle_plate_number") as string;
  const phone = formData.get("phone") as string;
  const document1 = formData.get("document1") as File;

  // First, insert into account_sign_up table
  const { error: signupError } = await supabase
    .from("account_sign_up")
    .insert({
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
      vehicle_plate_number: vehiclePlateNumber,
      phone: phone,
      id_link: null 
    });

  if (signupError) {
    console.log("Error signing up", signupError);
    throw new Error(signupError.message);
  }

  // Handle document upload if provided
  if (document1) {
    try {
      const fileExt = document1.name.split(".").pop();
      const fileName = `${email}-id.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("hau2park")
        .upload(fileName, document1);

      if (uploadError) {
        console.log("Error uploading document", uploadError);
      } else {
        // Only update if upload succeeded
        const { data: { publicUrl } } = supabase.storage
          .from("hau2park") // Use the same bucket for consistency
          .getPublicUrl(fileName);

        await supabase
          .from("account_sign_up")
          .update({ id_link: publicUrl })
          .eq("email", email);
      }
    } catch (docError) {
      console.error("Document upload error:", docError);
      // Continue with registration even if document upload fails
    }
  }

  revalidatePath("/auth/login");
  
  // Return success instead of redirecting
  return { success: true, message: "Registration pending approval" };
}

export async function ResetPassword(formData: FormData) {
  const supabase = await createClient();
  
  const password = formData.get("password") as string;
  
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  redirect("/auth/login");
}