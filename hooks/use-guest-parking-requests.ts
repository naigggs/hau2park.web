"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { GuestList } from "@/app/types/guest-list";
import { PostgrestError } from "@supabase/supabase-js";
import { useUserInfo } from "@/hooks/use-user-info";

interface RawGuestParkingRequest {
  id: number;
  title: string;
  appointment_date: string;
  purpose_of_visit: string;
  parking_start_time: string;
  parking_end_time: string;
  status: string;
  created_at: string;
  user_id_info: {
    first_name: string;
    last_name: string;
    email: string;
    vehicle_plate_number: string;
    phone: string;
    user_id: string;
  };
}

export const useGuestParkingRequests = () => {
  const { user, isLoading: userLoading, error: userError } = useUserInfo();
  const [requests, setRequests] = useState<GuestList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.user_id) return;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("guest_parking_request")
        .select(`
          id,
          title,
          appointment_date,
          purpose_of_visit,
          parking_start_time,
          parking_end_time,
          status,
          created_at,
          user_id_info:user_id (
            first_name,
            last_name,
            email,
            vehicle_plate_number,
            phone,
            user_id
          )
        `)
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error);
      } else if (data) {
        const transformedData: GuestList[] = (data as unknown as RawGuestParkingRequest[]).map(request => ({
          ...request,
          user_id: request.user_id_info
        }));
        setRequests(transformedData);
      }
      setIsLoading(false);
    };

    fetchRequests();
  }, [user?.user_id]);

  return {
    requests,
    isLoading: userLoading || isLoading,
    error: error || userError
  };
};