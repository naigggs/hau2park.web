"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const pageTitles: { [key: string]: string } = {
    "/admin/dashboard": "Admin Dashboard",
    "/admin/parking": "Parking Spaces",
    "/admin/accounts": "Accounts",
    "/admin/guest-list": "Guest List",
    "/staff/qr-parking": "QR Parking",
    "/guest/dashboard": "Guest Dashboard",
    "/guest/chat-bot": "HAU2Park Chatbot",
    "/guest/qr-code": "QR Code List",
  };

  const pageTitle = pageTitles[pathname] || "Unknown Page";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
