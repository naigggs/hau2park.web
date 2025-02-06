"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export const useGuestListSubscription = () => {
  const [guestList, setGuestList] = useState<GuestList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const subscription = supabase
      .channel("guest-list-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guest_parking_request" },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              setGuestList((prev) => [payload.new as GuestList, ...prev]);
              break;
            case "UPDATE":
              setGuestList((prev) =>
                prev.map((guest) =>
                  guest.id === (payload.new as GuestList).id
                    ? (payload.new as GuestList)
                    : guest
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
