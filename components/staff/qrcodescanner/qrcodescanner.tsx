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
                    console.log("Parsed data:", parsedData);

                    const supabase = createClient();
                    const { data: existingRow, error } = await supabase
                        .from("visitor_approvals")
                        .select("*")
                        .eq("id", parsedData.id)
                        .eq("status", "Approved")
                        .eq("email", parsedData.email)
                        .eq("secret_key", parsedData.secret_key)
                        .single();

                    if (error) {
                        console.log("No existing row found");
                        setAcceptedMessage("Your parking request has been denied.");
                        return;
                    }

                    if (existingRow) {
                        console.log("Row exists:", existingRow);
                        setExistingRow(existingRow);
                        setAcceptedMessage("Your parking request has been accepted!"); 
                    }
                } catch (error) {
                    console.error("Error parsing QR code data: ", error);
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
                <h2 className="text-xl font-semibold">Scanned Data:</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(existingRow, null, 2)}
                </pre>
            </div>
            )}
            {acceptedMessage && (
            <p className="mt-4 text-green-600 font-semibold text-center">
                {acceptedMessage}
            </p>
            )}
        </div>
    );
};

export default QrCodeScanner;
