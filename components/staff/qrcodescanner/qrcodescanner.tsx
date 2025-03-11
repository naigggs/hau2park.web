"use client";

import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { createClient } from "@/utils/supabase/client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, QrCode, User, Calendar, Clock, FileText, Timer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const QrCodeScanner: React.FC = () => {
    const [existingRow, setExistingRow] = useState<any | null>(null);
    const [acceptedMessage, setAcceptedMessage] = useState<string | null>(null);
    const [scanning, setScanning] = useState<boolean>(true);
    const [userData, setUserData] = useState<any | null>(null);
    const [parkingRequestData, setParkingRequestData] = useState<any | null>(null);

    const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            if (result) {
                try {
                    // Pause scanning while processing
                    setScanning(false);
                    
                    const parsedData = JSON.parse(result);
                    console.log("Parsed QR code data:", parsedData);    
                    const supabase = createClient();

                    const { data: qrCodeData, error: qrCheckError } = await supabase
                        .from("guest_qr_codes")
                        .select("*")
                        .eq("user_id", parsedData.user_id)
                        .eq("secret_key", parsedData.secret_key)
                        .single();

                    if (!qrCodeData) {
                        setAcceptedMessage("QR code not found in the system.");
                        setTimeout(() => setScanning(true), 2000);
                        return;
                    }

                    // Fetch user details from user_info table
                    const { data: userInfo, error: userError } = await supabase
                        .from("user_info")
                        .select("*")
                        .eq("user_id", parsedData.user_id)
                        .single();
                    
                    if (userError) {
                        console.error("Error fetching user info:", userError);
                        setAcceptedMessage("Error fetching user information.");
                        setTimeout(() => setScanning(true), 2000);
                        return;
                    }

                    // Fetch parking request details from guest_parking_request table
                    const { data: parkingRequest, error: parkingRequestError } = await supabase
                        .from("guest_parking_request")
                        .select("*")
                        .eq("user_id", parsedData.user_id)
                        .eq("secret_key", parsedData.secret_key)
                        .single();

                    if (parkingRequestError) {
                        console.error("Error fetching parking request:", parkingRequestError);
                        setAcceptedMessage("Error fetching parking request details.");
                        setTimeout(() => setScanning(true), 2000);
                        return;
                    }

                    // Set data to state
                    setUserData(userInfo);
                    setParkingRequestData(parkingRequest);

                    if (qrCodeData.is_used) {
                        setAcceptedMessage("This QR code has already been used.");
                        setExistingRow({...qrCodeData, user_info: userInfo, parking_request: parkingRequest});
                        setTimeout(() => setScanning(true), 2000);
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
                        setTimeout(() => setScanning(true), 2000);
                        return;
                    }

                    setExistingRow({...qrCodeData, user_info: userInfo, parking_request: parkingRequest});
                    setAcceptedMessage("QR code successfully validated and marked as used!"); 
                    
                    // Resume scanning after a delay
                    setTimeout(() => setScanning(true), 5000);

                } catch (error) {
                    console.error("Error processing QR code: ", error);
                    setAcceptedMessage("Invalid QR code format.");
                    setTimeout(() => setScanning(true), 2000);
                }
            }
        }
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 space-y-4">
            <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl border-2">
                <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Staff QR Scanner
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                        {scanning && (
                            <Scanner 
                                onScan={handleScan} 
                                classNames={{
                                    container: 'w-full', 
                                    video: 'w-full aspect-square object-cover'
                                }}
                            />
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-2">
                        Position the QR code within the frame to scan
                    </div>
                </CardContent>
            </Card>

            {acceptedMessage && (
                <Alert 
                    className={`w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
                        acceptedMessage.includes("successfully") 
                            ? "border-green-500 bg-green-50" 
                            : "border-red-500 bg-red-50"
                    }`}
                >
                    {acceptedMessage.includes("successfully") ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle>
                        {acceptedMessage.includes("successfully") ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription>{acceptedMessage}</AlertDescription>
                </Alert>
            )}

            {existingRow && userData && parkingRequestData && (
                <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl border shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                            <span className="text-lg font-bold flex items-center gap-2">
                                <User className="h-5 w-5" /> 
                                Guest Information
                            </span>
                            <Badge variant={existingRow.is_used ? "secondary" : "default"}>
                                {existingRow.is_used ? "USED" : "VALID"}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {/* User Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-muted p-3 rounded-md">
                                <span className="text-xs font-medium text-muted-foreground block">FULL NAME</span>
                                <span className="font-medium">
                                    {userData.first_name} {userData.last_name}
                                </span>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <span className="text-xs font-medium text-muted-foreground block">EMAIL</span>
                                <span className="font-medium">{userData.email}</span>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <span className="text-xs font-medium text-muted-foreground block">VEHICLE PLATE NUMBER</span>
                                <span className="font-medium">
                                    {userData.vehicle_plate_number || 'No plate number'}
                                </span>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <span className="text-xs font-medium text-muted-foreground block">ISSUED DATE</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(existingRow.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Parking Request Information */}
                        <div className="bg-primary/5 p-3 rounded-md mt-4">
                            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Parking Request Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-background p-3 rounded-md">
                                    <span className="text-xs font-medium text-muted-foreground block">TITLE</span>
                                    <span className="font-medium">{parkingRequestData.title}</span>
                                </div>
                                <div className="bg-background p-3 rounded-md">
                                    <span className="text-xs font-medium text-muted-foreground block">PURPOSE OF VISIT</span>
                                    <span className="font-medium">{parkingRequestData.purpose_of_visit}</span>
                                </div>
                                <div className="bg-background p-3 rounded-md">
                                    <span className="text-xs font-medium text-muted-foreground block">APPOINTMENT DATE</span>
                                    <span className="font-medium">{parkingRequestData.appointment_date}</span>
                                </div>
                                <div className="bg-background p-3 rounded-md">
                                    <span className="text-xs font-medium text-muted-foreground block">PARKING TIME</span>
                                    <span className="font-medium flex items-center gap-1">
                                        <Timer className="h-4 w-4" />
                                        {parkingRequestData.parking_start_time} - {parkingRequestData.parking_end_time}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted p-3 rounded-md">
                            <span className="text-xs font-medium text-muted-foreground block">USE STATUS</span>
                            <span className="font-medium flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {existingRow.is_used ? formatDate(existingRow.used_at) : "Not used yet"}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-4 mt-2">
                        <div className="text-xs text-muted-foreground">
                            QR Code ID: {existingRow.id}
                        </div>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default QrCodeScanner;
