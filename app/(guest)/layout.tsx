import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import "@/app/shared/css/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/guest/sidebar/app-sidebar";
import Header from "@/components/shared/header/header";
import { UserProvider } from "../context/user-context";
import RealtimeListener from "@/components/shared/realtime-listener/realtime-listener";

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
  title: "Guest Dashboard",
};

export default async function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
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
      </body>
    </html>
  );
}
