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

export const approveAccount = async (id: number, user_id: string) => {
  const supabase = createClient();

  try {
    // Get the signup data first
    const { data: signupData, error: signupError } = await supabase
      .from("account_sign_up")
      .select("*")
      .eq("id", id)
      .single();

    if (signupError) {
      console.error("Error fetching signup data:", signupError);
      return { error: signupError.message };
    }

    // STEP 1: Check if the email already exists in user_info table
    const { data: existingUserInfo, error: userCheckError } = await supabase
      .from("user_info")
      .select("user_id")
      .eq("email", signupData.email)
      .maybeSingle();
    
    if (userCheckError) {
      console.error("Error checking for existing user:", userCheckError);
    }
    
    // STEP 2: Check if email exists in Auth system
    const { data, error: listError } = await supabaseAdminClient.auth.admin.listUsers();
    
    let existingAuthUser = null;
    if (!listError && data) {
      existingAuthUser = data.users.find(u => 
        u.email && u.email.toLowerCase() === signupData.email.toLowerCase()
      );
    }
    
    // STEP 3: If user exists in either place, clean it up
    if (existingUserInfo?.user_id || existingAuthUser) {
      console.log(`Found existing user with email ${signupData.email}. Cleaning up before creating new user.`);
      
      const userId = existingUserInfo?.user_id || existingAuthUser?.id;
      
      if (userId) {
        // Delete from user_info table if exists
        const { error: deleteUserError } = await supabase
          .from("user_info")
          .delete()
          .eq("user_id", userId);
          
        if (deleteUserError) {
          console.log("Error deleting user_info (might not exist):", deleteUserError);
        }
        
        // Delete from user_roles table if exists
        const { error: deleteRoleError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
          
        if (deleteRoleError) {
          console.log("Error deleting user_roles (might not exist):", deleteRoleError);
        }
        
        // Delete from Auth if exists
        if (existingAuthUser) {
          const { error: deleteAuthError } = await supabaseAdminClient.auth.admin.deleteUser(userId);
          
          if (deleteAuthError) {
            console.error("Error deleting user from Auth:", deleteAuthError);
            return { error: `Failed to delete existing user: ${deleteAuthError.message}` };
          }
        }
      }
    }

    // STEP 4: Now create the new user in Auth
    console.log(`Creating new user with email ${signupData.email}`);
    const { data: authData, error: authError } = await supabaseAdminClient.auth.admin.createUser({
      email: signupData.email,
      password: signupData.password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Error creating user in auth:", authError);
      return { error: authError.message };
    }

    const userId = authData.user.id;

    // Create user info
    const { error: userInfoError } = await supabase.from("user_info").insert({
      user_id: userId,
      email: signupData.email,
      first_name: signupData.first_name,
      last_name: signupData.last_name,
      vehicle_plate_number: signupData.vehicle_plate_number,
      phone: signupData.phone
    });

    if (userInfoError) {
      console.error("Error creating user info:", userInfoError);
      return { error: userInfoError.message };
    }

    // Set user role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "User"
    });

    if (roleError) {
      console.error("Error setting user role:", roleError);
      return { error: roleError.message };
    }

    // Delete signup data
    const { error: deleteError } = await supabase
      .from("account_sign_up")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting signup data:", deleteError);
      return { error: deleteError.message };
    }

    // Send email notification
    const emailPayload = {
      to: signupData.email,
      subject: "Account Registration Approved",
      html: `
        <h1 style="text-align: center; font-family: Arial, sans-serif; color: #333;">HAU2Park</h1>
        <p>Your account registration has been approved. You can now log in using your email and password.</p>
      `
    };

    await fetch("/api/admin/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    return { success: true, userId };
  } catch (error) {
    console.error("Unexpected error during approval:", error);
    return { error: "An unexpected error occurred" };
  }
};

export const declineAccount = async (id: number) => {
  const supabase = createClient();

  try {
    // Get the signup data first for the email
    const { data: signupData, error: signupError } = await supabase
      .from("account_sign_up")
      .select("email")
      .eq("id", id)
      .single();

    if (signupError) {
      console.error("Error fetching signup data:", signupError);
      return { error: signupError.message };
    }

    // Delete signup data
    const { error: deleteError } = await supabase
      .from("account_sign_up")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting signup data:", deleteError);
      return { error: deleteError.message };
    }

    // Send email notification
    const emailPayload = {
      to: signupData.email,
      subject: "Account Registration Declined",
      html: `
        <h1 style="text-align: center; font-family: Arial, sans-serif; color: #333;">HAU2Park</h1>
        <p>We regret to inform you that your account registration has been declined. If you believe this is an error, please contact our support team.</p>
      `
    };

    await fetch("/api/admin/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    return { success: true };
  } catch (error) {
    console.error("Unexpected error during decline:", error);
    return { error: "An unexpected error occurred" };
  }
};
