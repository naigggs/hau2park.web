"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export const useGuestQRCodeList = () => {
  const [guestQRList, setGuestQRList] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("guest_qr_codes")
        .select("*")
        .eq("user_id", "2eb76e8a-7ae0-48f8-8c65-f322f696ce39"); // change to actual user id

      if (error) {
        setError(error);
      } else {
        setGuestQRList(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return { guestQRList, loading, error };
};
