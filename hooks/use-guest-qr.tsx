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
    // Keep loading true while waiting for userId
    if (!userId) {
      return;
    }

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("guest_qr_codes")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          setError(error);
        } else {
          setGuestQRList(data || []);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]); 

  // Reset states when userId changes to null
  useEffect(() => {
    if (!userId) {
      setGuestQRList([]);
      setError(null);
      setLoading(true);
    }
  }, [userId]);

  return { guestQRList, loading, error };
};
