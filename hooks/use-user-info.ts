"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserInfo {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  vehicle_plate_number?: string;
  created_at: string;
}

export function useUserInfo() {
  const supabase = createClient();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setIsLoading(true);
        
        // First get the current session to obtain user ID
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          throw new Error("No active session found");
        }
        
        const userId = sessionData.session.user.id;
        
        // Then fetch user details from user_info table
        const { data, error: userError } = await supabase
          .from("user_info")
          .select("*")
          .eq("user_id", userId)
          .single();
        
        if (userError) {
          throw userError;
        }
        
        if (data) {
          setUser(data as UserInfo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching user information:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  return { user, isLoading, error };
}