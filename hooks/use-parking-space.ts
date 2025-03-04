"use client";

import { createClient } from "@/utils/supabase/client";
import { PostgrestError, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useParkingSpaces = () => {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("parking_spaces")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError(error);
    } else {
      setParkingSpaces(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let parkingChannel: RealtimeChannel;

    const setupSubscription = async () => {
      // Initial fetch
      await fetchData();

      // Set up realtime subscription
      parkingChannel = supabase
        .channel('parking_changes')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'parking_spaces'
          },
          (payload) => {
            setParkingSpaces(current => [...current, payload.new as ParkingSpace].sort((a, b) => a.id - b.id));
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'parking_spaces'
          },
          (payload) => {
            setParkingSpaces(current =>
              current.map(space =>
                space.id === payload.new.id
                  ? { ...space, ...payload.new }
                  : space
              )
            );
          }
        )
        .on('postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'parking_spaces'
          },
          (payload) => {
            setParkingSpaces(current =>
              current.filter(space => space.id !== payload.old.id)
            );
          }
        )
        .subscribe();
    };

    setupSubscription();

    // Cleanup subscription when component unmounts
    return () => {
      if (parkingChannel) {
        supabase.removeChannel(parkingChannel);
      }
    };
  }, []);

  return { parkingSpaces, error, isLoading, refresh: fetchData };
};
