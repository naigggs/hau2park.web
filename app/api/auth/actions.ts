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
    console.log("Login Error", error);
    return error;
  }

  const { data: roleData, error: roleError } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", authData.user.id)
  .single();

if (roleError) {
  console.log("Error fetching role:", roleError);
  redirect("/auth/login");
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

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    vehiclePlateNumber: formData.get("vehiclePlateNumber") as string,
  };

  const { data: guestData, error } = await supabase.auth.signUp(data);

  if (error) {
    console.log("Guest Sign Up", error);
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
  });

  if (profileError) {
    console.log("Guest Profile Error", profileError);
  }

  revalidatePath("/guest/qr-code", "layout");
  redirect("/guest/qr-code");
}
