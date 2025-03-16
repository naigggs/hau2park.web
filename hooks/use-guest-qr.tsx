"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/app/context/user-context";

export const useGuestQRCodeList = () => {
  const [guestQRList, setGuestQRList] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canCreateRequest, setCanCreateRequest] = useState(true);
  const { userId } = useUser();

  const supabase = createClient();

  const fetchData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guest_qr_codes")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        setError(error);
      } else {
        setGuestQRList(data || []);
        
        // Calculate active QR codes:
        // 1. QR codes that are available (not expired and not used)
        // 2. "Active" QR codes (is_used === true and status === 'Open')
        const hasActiveQRCode = (data || []).some(qr => {
          if (qr.status !== 'Expired' && !qr.is_used) return true;
          if (qr.status === 'Open' && qr.is_used === true) return true;
          return false;
        });
        setCanCreateRequest(!hasActiveQRCode);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a QR code
  const deleteQRCode = async (id: number): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("guest_qr_codes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId); // Ensure they can only delete their own QR codes

      if (error) throw error;
      
      // Update local state after deletion
      setGuestQRList(prev => prev.filter(qr => qr.id !== id));
      // Optionally re-check canCreateRequest if needed after deletion
      setCanCreateRequest(true);
      
      return true;
    } catch (err) {
      console.error("Error deleting QR code:", err);
      return false;
    }
  };

  useEffect(() => {
    if (!userId) {
      setGuestQRList([]);
      setError(null);
      setLoading(true);
      return;
    }
    fetchData();
  }, [userId]);

  return { 
    guestQRList, 
    loading, 
    error, 
    deleteQRCode, 
    canCreateRequest,
    refresh: fetchData 
  };
};
