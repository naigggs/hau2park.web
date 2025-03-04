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
      url: "/user/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "HAU2Park Chatbot",
      url: "/user/chat-bot",
      icon: Bot,
      isActive: true,
    },
  ],
};
