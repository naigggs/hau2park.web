import { createClient } from "@/utils/supabase/client";
import QRCode from "qrcode";

export const updateVisitorApprovalStatus = async (
  id: number,
  status: string,
  email: string,
  user_id: string
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
