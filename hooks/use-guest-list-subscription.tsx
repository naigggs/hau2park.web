"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export const useGuestListSubscription = () => {
  const [guestList, setGuestList] = useState<GuestList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchGuestWithUser = async (guest: GuestList) => {
    const { data, error } = await supabase
      .from("guest_parking_request")
      .select("*, user_id(*)")
      .eq("id", guest.id)
      .single();

    if (error) {
      console.error("Error fetching guest with user data:", error);
      return guest; 
    }

    return data;
  };

  useEffect(() => {
    const subscription = supabase
      .channel("guest-list-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guest_parking_request" },
        async (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              const newGuestWithUser = await fetchGuestWithUser(payload.new as GuestList);
              setGuestList((prev) => [newGuestWithUser, ...prev]);
              break;
            case "UPDATE":
              const updatedGuestWithUser = await fetchGuestWithUser(payload.new as GuestList);
              setGuestList((prev) =>
                prev.map((guest) =>
                  guest.id === updatedGuestWithUser.id ? updatedGuestWithUser : guest
                )
              );
              break;
            case "DELETE":
              setGuestList((prev) =>
                prev.filter((guest) => guest.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("guest_parking_request")
        .select("*, user_id(*)");

      if (error) {
        setError(error);
      } else {
        setGuestList(data);
      }
      setLoading(false);
    };

    fetchData();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { guestList, loading, error };
};