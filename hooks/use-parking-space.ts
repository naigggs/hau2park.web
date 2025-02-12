"use client";

import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useParkingSpaces = () => {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("parking_spaces")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        setError(error);
      } else {
        setParkingSpaces(data);
      }
    };

    fetchData();
  }, []);

  return { parkingSpaces, error };
};
