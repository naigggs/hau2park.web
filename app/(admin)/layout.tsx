import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "@/app/shared/css/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/admin/sidebar/app-sidebar";
import Header from "@/components/shared/header/header";
import { UserProvider } from "../context/user-context";
import { GlobalLoader } from "@/components/ui/global-loader";
import { NavigationEvents } from '@/components/shared/navigation-events';
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    template: "HAU2PARK | %s",
    default: "HAU2PARK | Admin"
  },
  description: "HAU2PARK Admin",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // await checkAdminAccess();

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Suspense
          fallback={
            <div className="container mx-auto p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <GlobalLoader />
          <NavigationEvents />
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <UserProvider>
                {children}
              </UserProvider>
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </Suspense>
      </body>
    </html>
  );
}
