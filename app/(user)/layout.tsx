import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "@/app/shared/css/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/user/sidebar/app-sidebar";
import Header from "@/components/shared/header/header";
import { UserProvider } from "../context/user-context";
import { ToastProvider } from "@/components/ui/toast";
import RealtimeListener from "@/components/shared/realtime-listener/realtime-listener";
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
    default: "HAU2PARK | User"
  },
  description: "HAU2PARK User",
};

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Suspense
          fallback={
            <div className="container mx-auto p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <GlobalLoader />
          <NavigationEvents />
          <UserProvider>
            <ToastProvider>
              <RealtimeListener />
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <Header />
                  {children}
                  <Toaster />
                </SidebarInset>
              </SidebarProvider>
            </ToastProvider>
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
