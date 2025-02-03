"use client";

import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useGuestList = () => {
  const [guestList, setGuestList] = useState<GuestList[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("visitor_approvals")
        .select("*");

      if (error) {
        setError(error);
      } else {
        setGuestList(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return { guestList, error, loading };
};
