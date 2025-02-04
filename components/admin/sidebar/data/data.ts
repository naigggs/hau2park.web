import {
  GalleryVerticalEnd,
  SquareTerminal,
  TicketPlus,
  RadioTower,
  NotebookPen
} from "lucide-react";

export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      url: "/admin/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Parking",
      url: "/admin/parking",
      icon: TicketPlus,
      isActive: true,
    },
    {
      title: "Guest List",
      url: "/admin/guest-list",
      icon: RadioTower,
      isActive: true,
    },
  ],
};
