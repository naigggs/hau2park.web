"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"

export function ActiveQRCode() {
  const [qrCode, setQrCode] = useState("https://example.com/qr/12345")

  const regenerateQRCode = () => {
    // In a real app, this would call an API to generate a new QR code
    setQrCode(`https://example.com/qr/${Math.random().toString(36).substr(2, 5)}`)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active QR Code</CardTitle>
        <QrCode className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-2">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode)}`}
            alt="QR Code"
            className="w-32 h-32"
          />
          <Button onClick={regenerateQRCode}>Regenerate QR Code</Button>
        </div>
      </CardContent>
    </Card>
  )
}

