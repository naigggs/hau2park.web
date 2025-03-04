import { createClient } from "@/utils/supabase/client";
import { supabaseAdminClient } from "@/utils/supabase/service-role";
import QRCode from "qrcode";

export const updateVisitorApprovalStatus = async (
  id: number,
  status: string,
  email: string,
  user_id: string,
  appointment_date: string
) => {
  const generateRandomKey = (length: number): string => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    const phraseToHide = "H!H4ck3r";

    if (length < phraseToHide.length) {
      throw new Error(
        "Length must be greater than or equal to the hidden phrase length."
      );
    }

    let result = "";
    for (let i = 0; i < length - phraseToHide.length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const randomIndex = Math.floor(
      Math.random() * (length - phraseToHide.length + 1)
    );
    result =
      result.slice(0, randomIndex) + phraseToHide + result.slice(randomIndex);

    return result;
  };

  const secretKey = generateRandomKey(20);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("guest_parking_request")
    .update({ status, secret_key: secretKey })
    .eq("id", id);

  if (error) {
    console.error(`Error updating visitor approval to ${status}:`, error);
    return null;
  }

  const qrData = {
    id: id,
    user_id: user_id,
    status: status,
    secret_key: secretKey,
  };

  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

  const { error: qrError } = await supabase.from("guest_qr_codes").insert({
    user_id: user_id,
    qr_code_url: qrCodeDataUrl,
    secret_key: qrData.secret_key,
    appointment_date: appointment_date,
  });

  if (qrError) {
    console.error("Error inserting QR code data:", qrError);
    return null;
  }

  const emailPayload: EmailPayload = {
    to: email,
    subject: "Visitor Approval Status Update",
    html:
      status === "Approved"
        ? `<h1 style="text-align: center; font-family: Arial, sans-serif; color: #333;">HAU2Park</h1>

<p>
  Your visitor approval status has been 
  <strong style="color: #4CAF50;">Approved</strong>. 
  Please find your QR code below:
</p>`
        : `
          <h1 style="text-align: center; font-family: Arial, sans-serif; color: #333;">HAU2Park</h1><p>
  Your visitor approval status has been 
  <strong style="color: #f44336;">Declined</strong>. 
  Unfortunately, your request was not approved. 
  If you require further assistance, please do not hesitate to contact our support team.
</p>`,
  };

  if (status === "Approved") {
    emailPayload.attachments = [
      {
        filename: "qrcode.png",
        content: qrCodeDataUrl.split(",")[1],
        encoding: "base64",
      },
    ];
  }

  await fetch("/api/admin/sendEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailPayload),
  });

  return data;
};

export const createNewUser = async (formData: FormData) => {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const vehiclePlateNumber = formData.get("vehiclePlateNumber") as string;
  const role = formData.get("role") as string;

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !vehiclePlateNumber ||
    !role
  ) {
    return { error: "All fields are required" };
  }

  try {
    const { data: authData, error: authError } =
      await supabaseAdminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("Error creating user:", authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "User creation failed" };
    }

    const userId = authData.user.id;

    const { error: userInfoError } = await supabase.from("user_info").insert({
      user_id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      vehicle_plate_number: vehiclePlateNumber,
    });

    if (userInfoError) {
      console.error("Error inserting user info:", userInfoError);
      return { error: userInfoError.message };
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role,
    });

    if (roleError) {
      console.error("Error inserting user role:", roleError);
      return { error: roleError.message };
    }

    return { success: true, userId };
  } catch (error) {
    console.error("Unexpected error during user creation:", error);
    return { error: "An unexpected error occurred" };
  }
};

export const deleteUser = async (userId: string) => {
  const supabase = createClient();

  try {
    const { error: userInfoError } = await supabase
      .from("user_info")
      .delete()
      .eq("user_id", userId);

    if (userInfoError) {
      console.error("Error deleting user info:", userInfoError);
      return { error: userInfoError.message };
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (roleError) {
      console.error("Error deleting user role:", roleError);
      return { error: roleError.message };
    }

    const { error: authError } =
      await supabaseAdminClient.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting user auth:", authError);
      return { error: authError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error during user deletion:", error);
    return { error: "An unexpected error occurred" };
  }
};

export async function updateUser(formData: FormData) {
  const supabase = createClient();

  const userId = formData.get("user_id") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const vehiclePlateNumber = formData.get("vehicle_plate_number") as string;
  const roleName = formData.get("role_name") as string;

  if (!userId || !firstName || !lastName || !vehiclePlateNumber || !roleName) {
    return { error: "All fields are required" };
  }

  try {
    const { error: userInfoError } = await supabase
      .from("user_info")
      .update({
        first_name: firstName,
        last_name: lastName,
        vehicle_plate_number: vehiclePlateNumber,
      })
      .eq("user_id", userId);

    if (userInfoError) {
      console.error("Error updating user info:", userInfoError);
      return { error: userInfoError.message };
    }

    // Update user_roles table
    const { error: roleError } = await supabase
      .from("user_roles")
      .update({ role: roleName })
      .eq("user_id", userId);

    if (roleError) {
      console.error("Error updating user role:", roleError);
      return { error: roleError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error during user update:", error);
    return { error: "An unexpected error occurred" };
  }
}
