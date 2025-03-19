import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/shared/css/globals.css";
import { GlobalLoader } from "@/components/ui/global-loader";
import { NavigationEvents } from '@/components/shared/navigation-events';
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "HAU2PARK | %s",
    default: "HAU2PARK Landing Page"
  },
  description: "HAU2PARK Landing Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={
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
        }>
          <GlobalLoader />
          <NavigationEvents />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
