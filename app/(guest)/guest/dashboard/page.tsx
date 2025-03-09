"use client";

import { Suspense } from "react";
import { ParkStats } from "@/components/guest/dashboard/park-stats";
import { ActiveQRCode } from "@/components/guest/dashboard/active-qr-code";
import { RecentVisits } from "@/components/guest/dashboard/recent-visits";
import { WeatherForecast } from "@/components/guest/dashboard/weather-forecast";
import { ParkPopularityChart } from "@/components/guest/dashboard/park-popularity-chart";
import { QuickActions } from "@/components/guest/dashboard/quick-actions";
import { ParkAmenities } from "@/components/guest/dashboard/park-ameneties";
import { useUserInfo } from "@/hooks/use-user-info";
import { ParkingStatus } from "@/components/guest/dashboard/parking-status";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuestDashboard() {
  const { user, isLoading, error } = useUserInfo();

  return (
    <div className="container mx-auto p-6">
      {(() => {
        const hours = new Date().getHours();
        let greeting;
        if (hours < 12) {
          greeting = "Good Morning";
        } else if (hours < 18) {
          greeting = "Good Afternoon";
        } else {
          greeting = "Good Evening";
        }

        // Display user's name if available
        if (isLoading) {
          return <h1 className="text-4xl font-bold mb-6">{greeting}</h1>;
        }

        if (error) {
          console.error("Error loading user info:", error);
          return <h1 className="text-4xl font-bold mb-6">{greeting}</h1>;
        }

        return (
          <h1 className="text-4xl font-bold mb-6">
            {greeting}
            {user ? `, ${user.first_name}` : ""}
          </h1>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <ActiveQRCode />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <ParkingStatus />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <QuickActions />
        </Suspense>

        <div className="lg:col-span-3"></div>
      </div>
    </div>
  );
}
