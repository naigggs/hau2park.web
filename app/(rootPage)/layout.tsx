import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/shared/css/globals.css";
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
    default: "HAU2Park - Smart Parking Management System"
  },
  description: "HAU2Park is an efficient parking management system that helps institutions, campuses, and organizations streamline their parking operations.",
  keywords: ["parking management", "smart parking", "HAU2Park", "campus parking", "parking system", "automated parking"],
  authors: [{ name: "HAU2Park Team" }],
  creator: "HAU2Park",
  publisher: "HAU2Park",
  alternates: {
    canonical: "https://hau2park-web.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hau2park-web.vercel.app",
    siteName: "HAU2Park",
    title: "HAU2Park - Smart Parking Management System",
    description: "Efficient parking management solution for campuses and institutions",
    images: [
      {
        url: "/public/images/hero.png",
        width: 1200,
        height: 630,
        alt: "HAU2Park",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HAU2Park - Smart Parking Management System",
    description: "Efficient parking management solution for campuses and institutions",
    images: ["/public/images/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
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