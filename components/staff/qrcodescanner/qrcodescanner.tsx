"use client";

import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { createClient } from "@/utils/supabase/client";
import React, { useState } from "react";

const QrCodeScanner: React.FC = () => {
    const [existingRow, setExistingRow] = useState<any | null>(null);
    const [acceptedMessage, setAcceptedMessage] = useState<string | null>(null);

    const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            if (result) {
                try {
                    const parsedData = JSON.parse(result);
                    const supabase = createClient();

                    // Check if there's existing QR code data first
                    const { data: qrCodeData, error: qrCheckError } = await supabase
                        .from("guest_qr_codes")
                        .select("*")
                        .eq("user_id", parsedData.user_id)
                        .eq("secret_key", parsedData.secret_key)
                        .single();

                    if (!qrCodeData) {
                        setAcceptedMessage("QR code not found in the system.");
                        return;
                    }

                    if (qrCodeData.is_used) {
                        setAcceptedMessage("This QR code has already been used.");
                        return;
                    }

                    // Update the QR code usage status immediately
                    const { error: updateError } = await supabase
                        .from("guest_qr_codes")
                        .update({ 
                            is_used: true,
                            used_at: new Date().toISOString(),
                        })
                        .eq("user_id", parsedData.user_id)
                        .eq("secret_key", parsedData.secret_key);

                    if (updateError) {
                        console.error("Error updating QR code status:", updateError);
                        setAcceptedMessage("Error updating QR code status.");
                        return;
                    }

                    setExistingRow(qrCodeData);
                    setAcceptedMessage("QR code successfully validated and marked as used!"); 

                } catch (error) {
                    console.error("Error processing QR code: ", error);
                    setAcceptedMessage("Invalid QR code format.");
                }
            }
        }
    };

    const customClassNames = {
        container: '', 
        video: '',
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <Scanner onScan={handleScan} classNames={customClassNames}/>
            </div>
            {existingRow && (
            <div className="mt-4 p-4 border rounded w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <h2 className="text-xl font-semibold">Scanned QR Code Data:</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(existingRow, null, 2)}
                </pre>
            </div>
            )}
            {acceptedMessage && (
            <div className={`mt-4 p-4 rounded text-center ${acceptedMessage.includes("Error") || acceptedMessage.includes("already") ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {acceptedMessage}
            </div>
            )}
        </div>
    );
};

export default QrCodeScanner;
