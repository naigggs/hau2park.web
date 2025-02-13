import React from "react";
import { Card, CardContent, CardHeader} from "../../ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParkingListLoading() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-8" />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-[100px] mx-auto" />
          <Skeleton className="h-4 w-[150px] mx-auto" />
          <Skeleton className="h-4 w-[120px] mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
