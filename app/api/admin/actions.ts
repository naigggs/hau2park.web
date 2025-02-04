import { createClient } from "@/utils/supabase/client";
import QRCode from "qrcode";

export const updateVisitorApprovalStatus = async (
  id: number,
  status: string,
  email: string
) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("visitor_approvals")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(`Error updating visitor approval to ${status}:`, error);
    return null;
  }

  const generateRandomKey = (length: number) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result.replace(/Hi Hacker/g, "");
  };

  const qrData = {
    id: id,
    email: email,
    status: status,
    secret_key: generateRandomKey(16),
  };

  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

  interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    attachments?: {
      filename: string;
      content: string;
      encoding: string;
    }[];
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