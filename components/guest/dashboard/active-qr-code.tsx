"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Eye, ExternalLink } from "lucide-react"
import { useGuestQRCodeList } from "@/hooks/use-guest-qr"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"

export function ActiveQRCode() {
  const { guestQRList, loading, error } = useGuestQRCodeList();
  const [mostRecentQR, setMostRecentQR] = useState<QRCode | null>(null);

  // Find the most recent active (not used) QR code
  useEffect(() => {
    if (guestQRList && guestQRList.length > 0) {
      // First try to find an unused QR code
      const activeQRCode = guestQRList
        .filter(qrCode => !qrCode.is_used)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      // If no unused QR code exists, just get the most recent one
      if (!activeQRCode) {
        const mostRecent = [...guestQRList].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        setMostRecentQR(mostRecent);
      } else {
        setMostRecentQR(activeQRCode);
      }
    }
  }, [guestQRList]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent QR Code</CardTitle>
        <QrCode className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="w-32 h-32" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">Error loading QR codes</p>
        ) : !mostRecentQR ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No QR codes available</p>
            <Button asChild>
              <Link href="/guest/qr-code">Create QR Code</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="border-4 border-gray-200 p-2 bg-white rounded-md mb-2">
              <Image
                src={mostRecentQR.qr_code_url}
                alt="QR Code"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                  mostRecentQR.is_used ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                } mr-2`}>
                  {mostRecentQR.is_used ? "Used" : "Active"}
                </span>
                <span className="text-xs text-gray-500">Created: {formatDate(mostRecentQR.created_at)}</span>
              </div>
              <div className="mt-3 flex justify-center space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/guest/qr-code`}>
                    <Eye className="h-3 w-3 mr-1" /> View All
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/guest/qr-code?new=true">
                    <ExternalLink className="h-3 w-3 mr-1" /> New QR
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

