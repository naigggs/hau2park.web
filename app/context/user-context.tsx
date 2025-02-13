"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserContextType {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/auth/getUserId");
        const data = await res.json();
        setUserId(data.userId);

        const supabase = createClient();
        const { data: userInfo, error } = await supabase
          .from('user_info')
          .select('first_name, last_name')
          .eq('user_id', data.userId)
          .single();

        if (userInfo) {
          setFirstName(userInfo.first_name);
          setLastName(userInfo.last_name);
        } else {
          console.error('No user info found:', error);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ userId, firstName, lastName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}