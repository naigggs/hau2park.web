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
      name: "Manibaug Porac",
      logo: GalleryVerticalEnd,
      plan: "Ticket System",
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
      title: "Submit Ticket",
      url: "/user/tickets",
      icon: TicketPlus,
      isActive: true,
    },
    {
      title: "Announcements",
      url: "/user/announcements",
      icon: RadioTower,
      isActive: true,
    },
    {
      title: "Surveys",
      url: "/user/surveys",
      icon: NotebookPen,
      isActive: true,
    },
  ],
};
