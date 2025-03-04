import {
  GalleryVerticalEnd,
  SquareTerminal,
  TicketPlus,
  RadioTower,
  NotebookPen,
  ScanQrCode,
} from "lucide-react";

export const data = {
  teams: [
    {
      name: "HAU2Park",
      logo: GalleryVerticalEnd,
      plan: "Parking Management System",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/staff/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Parking",
      url: "/staff/parking",
      icon: TicketPlus,
      isActive: true,
    },
    {
      title: "QR Code Scanner",
      url: "/staff/qr-parking",
      icon: ScanQrCode,
      isActive: true,
    },
  ],
};
