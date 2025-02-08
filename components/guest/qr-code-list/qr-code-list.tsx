'use client'

import { useState, useEffect, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { QRCodeModal } from './qr-code-modal'
import { useGuestQRCodeList } from '@/hooks/use-guest-qr'

export default function QRCodeList() {
  const {guestQRList, loading, error} = useGuestQRCodeList()
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null)

  console.log(guestQRList)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleCardClick = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div>Error loading QR Code list: {error.message}</div>;
  }
console.log(guestQRList)
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guestQRList.map((qrCode) => (
          <Card 
            key={qrCode.id} 
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handleCardClick(qrCode)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
              </CardTitle>
              <Badge variant={qrCode.is_used ? "secondary" : "default"}>
                {qrCode.is_used ? "Used" : "Available"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                <Image
                  src={qrCode.qr_code_url}
                  alt="QR Code" 
                  width={150}
                  height={150}
                />
              </div>
              <p className="text-xs text-muted-foreground">
              Created: {formatDate(qrCode.created_at)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <QRCodeModal 
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        qrCode={selectedQRCode}
      />
    </div>
  )
}
