"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/user-context";

export const useGuestQRCodeList = () => {
  const [guestQRList, setGuestQRList] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userId } = useUser();

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("guest_qr_codes")
        .select("*")
        .eq("user_id", userId);

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
