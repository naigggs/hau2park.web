import {
  GalleryVerticalEnd,
  SquareTerminal,
  TicketPlus,
  RadioTower,
  NotebookPen
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
      title: "Accounts",
      url: "/admin/accounts",
      icon: NotebookPen,
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
