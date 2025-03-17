"use client"

import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner"
import { createClient } from "@/utils/supabase/client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, QrCode, User, Calendar, Clock, FileText, Timer, Camera, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

const QrCodeScanner: React.FC = () => {
  const [existingRow, setExistingRow] = useState<any | null>(null)
  const [acceptedMessage, setAcceptedMessage] = useState<string | null>(null)
  const [scanning, setScanning] = useState<boolean>(true)
  const [userData, setUserData] = useState<any | null>(null)
  const [parkingRequestData, setParkingRequestData] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string>("scanner")

  // Use the media query hook for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Reset state when returning to scanner
  useEffect(() => {
    if (activeTab === "scanner" && !scanning) {
      // Clear previous scan data when returning to scanner
      setTimeout(() => {
        setScanning(true)
      }, 500)
    }
  }, [activeTab, scanning])

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue
      if (result) {
        try {
          // Pause scanning while processing
          setScanning(false)

          const parsedData = JSON.parse(result)
          console.log("Parsed QR code data:", parsedData)
          const supabase = createClient()

          const { data: qrCodeData, error: qrCheckError } = await supabase
            .from("guest_qr_codes")
            .select("*")
            .eq("user_id", parsedData.user_id)
            .eq("secret_key", parsedData.secret_key)
            .single()

          if (!qrCodeData) {
            setAcceptedMessage("QR code not found in the system.")
            setTimeout(() => setScanning(true), 2000)
            return
          }

          // Fetch user details from user_info table
          const { data: userInfo, error: userError } = await supabase
            .from("user_info")
            .select("*")
            .eq("user_id", parsedData.user_id)
            .single()

          if (userError) {
            console.error("Error fetching user info:", userError)
            setAcceptedMessage("Error fetching user information.")
            setTimeout(() => setScanning(true), 2000)
            return
          }

          // Fetch parking request details from guest_parking_request table
          const { data: parkingRequest, error: parkingRequestError } = await supabase
            .from("guest_parking_request")
            .select("*")
            .eq("user_id", parsedData.user_id)
            .eq("secret_key", parsedData.secret_key)
            .single()

          if (parkingRequestError) {
            console.error("Error fetching parking request:", parkingRequestError)
            setAcceptedMessage("Error fetching parking request details.")
            setTimeout(() => setScanning(true), 2000)
            return
          }

          // Set data to state
          setUserData(userInfo)
          setParkingRequestData(parkingRequest)

          if (qrCodeData.is_used) {
            setAcceptedMessage("This QR code has already been used.")
            setExistingRow({ ...qrCodeData, user_info: userInfo, parking_request: parkingRequest })
            // Switch to details tab automatically
            setActiveTab("details")
            return
          }

          // Update the QR code usage status immediately
          const { error: updateError } = await supabase
            .from("guest_qr_codes")
            .update({
              is_used: true,
              used_at: new Date().toISOString(),
            })
            .eq("user_id", parsedData.user_id)
            .eq("secret_key", parsedData.secret_key)

          if (updateError) {
            console.error("Error updating QR code status:", updateError)
            setAcceptedMessage("Error updating QR code status.")
            setTimeout(() => setScanning(true), 2000)
            return
          }

          setExistingRow({ ...qrCodeData, user_info: userInfo, parking_request: parkingRequest })
          setAcceptedMessage("QR code successfully validated and marked as used!")

          // Switch to details tab automatically
          setActiveTab("details")
        } catch (error) {
          console.error("Error processing QR code: ", error)
          setAcceptedMessage("Invalid QR code format.")
          setTimeout(() => setScanning(true), 2000)
        }
      }
    }
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const resetScanner = () => {
    setExistingRow(null)
    setUserData(null)
    setParkingRequestData(null)
    setAcceptedMessage(null)
    setScanning(true)
    setActiveTab("scanner")
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 space-y-4 min-h-[90vh] bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="scanner" disabled={!scanning && !existingRow}>
              <Camera className="h-4 w-4 mr-2" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="details" disabled={!existingRow}>
              <User className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border shadow-lg overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground p-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <QrCode className="h-5 w-5" />
                      Staff QR Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="w-full rounded-xl overflow-hidden border-2 border-primary/20 shadow-inner bg-black">
                      {scanning && (
                        <Scanner
                          onScan={handleScan}
                          classNames={{
                            container: "w-full",
                            video: "w-full aspect-square object-cover",
                          }}
                        />
                      )}
                      {!scanning && !existingRow && (
                        <div className="w-full aspect-square flex items-center justify-center bg-black/90">
                          <div className="animate-spin">
                            <RefreshCw className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Position QR code within frame
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {acceptedMessage && !existingRow && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                    <Alert
                      className={`${
                        acceptedMessage.includes("successfully")
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                          : "border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                      }`}
                    >
                      {acceptedMessage.includes("successfully") ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      <AlertTitle>{acceptedMessage.includes("successfully") ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{acceptedMessage}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <AnimatePresence mode="wait">
              {existingRow && userData && parkingRequestData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border shadow-lg overflow-hidden">
                    <CardHeader className="pb-2 border-b bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          Guest Information
                        </CardTitle>
                        <Badge
                          variant={existingRow.is_used ? "secondary" : "default"}
                          className={`${existingRow.is_used ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" : ""}`}
                        >
                          {existingRow.is_used ? "USED" : "VALID"}
                        </Badge>
                      </div>

                      {acceptedMessage && (
                        <Alert
                          className={`mt-4 ${
                            acceptedMessage.includes("successfully")
                              ? "border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                              : "border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                          }`}
                        >
                          {acceptedMessage.includes("successfully") ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                          <AlertTitle>{acceptedMessage.includes("successfully") ? "Success" : "Error"}</AlertTitle>
                          <AlertDescription>{acceptedMessage}</AlertDescription>
                        </Alert>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                      {/* User Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-muted/50 p-3 rounded-md border border-border/50">
                          <span className="text-xs font-medium text-muted-foreground block">FULL NAME</span>
                          <span className="font-medium">
                            {userData.first_name} {userData.last_name}
                          </span>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md border border-border/50">
                          <span className="text-xs font-medium text-muted-foreground block">EMAIL</span>
                          <span className="font-medium">{userData.email}</span>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md border border-border/50">
                          <span className="text-xs font-medium text-muted-foreground block">VEHICLE PLATE NUMBER</span>
                          <span className="font-medium">{userData.vehicle_plate_number || "No plate number"}</span>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md border border-border/50">
                          <span className="text-xs font-medium text-muted-foreground block">ISSUED DATE</span>
                          <span className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formatDate(existingRow.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Parking Request Information */}
                      <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Parking Request Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-background p-3 rounded-md border border-border/50">
                            <span className="text-xs font-medium text-muted-foreground block">TITLE</span>
                            <span className="font-medium">{parkingRequestData.title}</span>
                          </div>
                          <div className="bg-background p-3 rounded-md border border-border/50">
                            <span className="text-xs font-medium text-muted-foreground block">PURPOSE OF VISIT</span>
                            <span className="font-medium">{parkingRequestData.purpose_of_visit}</span>
                          </div>
                          <div className="bg-background p-3 rounded-md border border-border/50">
                            <span className="text-xs font-medium text-muted-foreground block">APPOINTMENT DATE</span>
                            <span className="font-medium">{parkingRequestData.appointment_date}</span>
                          </div>
                          <div className="bg-background p-3 rounded-md border border-border/50">
                            <span className="text-xs font-medium text-muted-foreground block">PARKING TIME</span>
                            <span className="font-medium flex items-center gap-1">
                              <Timer className="h-4 w-4 text-primary" />
                              {parkingRequestData.parking_start_time} - {parkingRequestData.parking_end_time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md border border-border/50">
                        <span className="text-xs font-medium text-muted-foreground block">USE STATUS</span>
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          {existingRow.is_used ? formatDate(existingRow.used_at) : "Not used yet"}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4 pb-4 bg-muted/30">
                      <div className="text-xs text-muted-foreground">QR Code ID: {existingRow.id}</div>
                      <Button onClick={resetScanner} variant="outline" size="sm" className="gap-1">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Scan Again
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default QrCodeScanner

