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
      code: string
      isUsed: boolean
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
            <DialogTitle>QR Code: {qrCode.code}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCode.code}`}
              alt={`QR Code ${qrCode.code}`}
              width={300}
              height={300}
            />
            <Badge variant={qrCode.isUsed ? "secondary" : "default"}>
              {qrCode.isUsed ? "Used" : "Available"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Created: {formatDate(qrCode.createdAt)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  