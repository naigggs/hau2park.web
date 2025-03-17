import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParkingListLoading() {
  return (
    <Card className="h-full overflow-hidden">
      {/* Status indicator bar skeleton */}
      <Skeleton className="h-1 w-full" />
      
      <CardContent className="p-4 space-y-4">
        {/* Header and badge */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        
        {/* Location */}
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-1.5 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        
        {/* Divider */}
        <Skeleton className="h-px w-full" />
        
        {/* User information */}
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-1.5 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Time information */}
        <Skeleton className="h-6 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}