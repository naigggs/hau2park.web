import { Suspense } from "react";
import { ParkStats } from "@/components/guest/dashboard/park-stats";
import { ActiveQRCode } from "@/components/guest/dashboard/active-qr-code";
import { RecentVisits } from "@/components/guest/dashboard/recent-visits";
import { WeatherForecast } from "@/components/guest/dashboard/weather-forecast";
import { ParkPopularityChart } from "@/components/guest/dashboard/park-popularity-chart";
import { QuickActions } from "@/components/guest/dashboard/quick-actions";
import { ParkAmenities } from "@/components/guest/dashboard/park-ameneties";

export default function GuestDashboard() {
  return (
    <div className="container mx-auto p-6">
      {/* change to actual user */}
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
        return <h1 className="text-4xl font-bold mb-6">{greeting} User!</h1>;
      })()}
      {/* change to actual user */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div>Loading park stats...</div>}>
          <ParkStats />
        </Suspense>
        <ActiveQRCode />
        <QuickActions />
        <RecentVisits />
        <WeatherForecast />
        <ParkAmenities />
        <ParkPopularityChart />
      </div>
    </div>
  );
}
