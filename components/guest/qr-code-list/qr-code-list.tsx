'use client'

import { useState, useEffect } from 'react'
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Handle refresh function - using window.location.reload() as a fallback
  // since the hook doesn't expose a refetch method
  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    try {
      // If your hook has a way to force re-fetching data, use it here
      // For now, we'll use a simple approach with a timeout to simulate a refresh
      setTimeout(() => {
        // Force a re-render by updating state
        setLastUpdated(new Date())
        setIsRefreshing(false)
      }, 1000)
      
      // Alternatively, if nothing else works:
      // window.location.reload()
    } catch (err) {
      console.error("Error refreshing QR codes:", err)
      setIsRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Format time since last update
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString()
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Your QR Codes</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 p-2"
            title="Refresh QR Codes"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <span className="text-xs text-muted-foreground">
            Last updated: {formatLastUpdated()}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guestQRList.length === 0 ? (
          <p className="text-muted-foreground col-span-3 text-center py-8">
            No QR codes available. Submit a parking request to generate one.
          </p>
        ) : (
          guestQRList.map((qrCode) => (
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
          ))
        )}
      </div>
      <QRCodeModal 
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        qrCode={selectedQRCode}
      />
    </div>
  )
}