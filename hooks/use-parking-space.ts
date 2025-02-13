"use client";

import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useParkingSpaces = () => {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { parkingSpaces, error, isLoading, refresh: fetchData };
};
