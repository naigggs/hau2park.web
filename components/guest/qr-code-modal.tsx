import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Badge } from "@/components/ui/badge"
  import Image from 'next/image'
  
  interface QRCodeModalProps {
    isOpen: boolean
    onClose: () => void
    qrCode: {
      secret_key: string
      is_used: boolean
      qr_code_url: string
      user_id: string
      createdAt: string
    } | null
  }
  
  export function QRCodeModal({ isOpen, onClose, qrCode }: QRCodeModalProps) {
    if (!qrCode) return null
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString()
    }
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <Image
              src={qrCode.qr_code_url}
              alt="QR Code"
              width={300}
              height={300}
            />
            <Badge variant={qrCode.is_used ? "secondary" : "default"}>
              {qrCode.is_used ? "Used" : "Available"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Created: {formatDate(qrCode.createdAt)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  