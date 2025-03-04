import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: {
    id: number;
    secret_key: string;
    is_used: boolean;
    qr_code_url: string;
    user_id: string;
    created_at: string;
  } | null;
}

export function QRCodeModal({ isOpen, onClose, qrCode }: QRCodeModalProps) {
  if (!qrCode) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Parking QR Ticket</DialogTitle>
        </DialogHeader>

        <Card className={`border-2 border-dashed ${qrCode.is_used ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} overflow-hidden`}>
          {/* Top section with title and decorative elements */}
          <CardHeader className={`${qrCode.is_used ? 'bg-red-600' : 'bg-blue-600'} text-white py-3 relative`}>
            <CardTitle className="text-center font-bold text-xl">
              HAU2PARK TICKET
            </CardTitle>
            <p className="text-center text-xs opacity-75">
              SCAN TO VALIDATE PARKING
            </p>
          </CardHeader>

          <CardContent className="p-4 flex flex-col items-center">
            {/* QR Code with frame */}
            <div className="border-4 border-gray-200 p-2 bg-white rounded-md mb-4 mt-2">
              <Image
                src={qrCode.qr_code_url}
                alt="Parking QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>

            {/* Ticket info */}
            <div className="w-full space-y-2 mt-2">
              <div className="bg-gray-50 p-2 rounded-sm flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  TICKET ID
                </span>
                <span className="font-mono font-medium">{qrCode.id}</span>
              </div>

              <div className="bg-gray-50 p-2 rounded-sm flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  STATUS
                </span>
                <Badge
                  variant={qrCode.is_used ? "secondary" : "default"}
                  className="px-3"
                >
                  {qrCode.is_used ? "USED" : "AVAILABLE"}
                </Badge>
              </div>

              <div className="bg-gray-50 p-2 rounded-sm flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  ISSUED
                </span>
                <span className="font-medium text-sm">
                  {formatDate(qrCode.created_at)}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className={`${qrCode.is_used ? 'bg-red-600' : 'bg-blue-600'} py-2 px-4 flex justify-center relative`}>
            <p className="text-white text-xs opacity-75">
              Present this ticket to parking attendant
            </p>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
