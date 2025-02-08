import {
  GalleryVerticalEnd,
  SquareTerminal,
  QrCode,
  Bot
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
      url: "/guest/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "HAU2Park Chatbot",
      url: "/guest/chat-bot",
      icon: Bot,
      isActive: true,
    },
    {
      title: "QR Code",
      url: "/guest/qr-code",
      icon: QrCode,
      isActive: true,
    },
  ],
};
