'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { QRCodeModal } from './qr-code-modal'

interface QRCode {
  id: string
  code: string
  isUsed: boolean
  createdAt: string
}

export default function QRCodeList() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null)

  const fetchQRCodes = async () => {
    setIsLoading(true)
    // In a real application, this would be an API call
    // For this example, we'll simulate an API call with setTimeout
    setTimeout(() => {
      const mockData: QRCode[] = [
        { id: '1', code: 'ABC123', isUsed: false, createdAt: '2025-02-01T12:00:00Z' },
        { id: '2', code: 'DEF456', isUsed: true, createdAt: '2025-02-02T14:30:00Z' },
        { id: '3', code: 'GHI789', isUsed: false, createdAt: '2025-02-03T09:15:00Z' },
        { id: '4', code: 'JKL012', isUsed: false, createdAt: '2025-02-04T16:45:00Z' },
        { id: '5', code: 'MNO345', isUsed: true, createdAt: '2025-02-05T11:20:00Z' },
      ]
      setQRCodes(mockData)
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    fetchQRCodes()
  }, []) // Added dependency array to fix the lint warning

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleCardClick = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={fetchQRCodes}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map((qrCode) => (
          <Card 
            key={qrCode.id} 
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handleCardClick(qrCode)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Code: {qrCode.code}
              </CardTitle>
              <Badge variant={qrCode.isUsed ? "secondary" : "default"}>
                {qrCode.isUsed ? "Used" : "Available"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCode.code}`}
                  alt={`QR Code ${qrCode.code}`}
                  width={150}
                  height={150}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Created: {formatDate(qrCode.createdAt)}
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
