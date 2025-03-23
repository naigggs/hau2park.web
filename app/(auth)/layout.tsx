import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/shared/css/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GlobalLoader } from "@/components/ui/global-loader";
import { NavigationEvents } from '@/components/shared/navigation-events';
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hau2park-web.vercel.app"),
  title: {
    template: "%s | HAU2Park",
    default: "Authentication | HAU2Park"
  },
  description: "Secure authentication for HAU2Park's smart parking management system. Log in to manage your parking needs.",
  keywords: ["HAU2Park login", "parking system login", "secure authentication", "HAU2Park access"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Authentication | HAU2Park",
    description: "Secure authentication for HAU2Park's smart parking management system",
    url: "https://hau2park-web.vercel.app/auth/login",
  },
  robots: {
    index: true, // Login pages should be indexed so users can find them
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded mt-6"></div>
            </div>
          </div>
        }>
          <GlobalLoader />
          <NavigationEvents />
          {children}
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}