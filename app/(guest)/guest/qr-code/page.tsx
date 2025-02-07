"use client";

import { useState } from "react";
import QRCodeList from "@/components/guest/qr-code-list/qr-code-list";
import { GenerateQRCodeModal } from "@/components/guest/qr-code-list/qr-code-modal-create";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function QRCodesPage() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Guest QR Codes</h1>
        <Button onClick={() => setIsGenerateModalOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Submit a Parking Request
        </Button>
      </div>
      <QRCodeList />
      <GenerateQRCodeModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
    </div>
  );
}
