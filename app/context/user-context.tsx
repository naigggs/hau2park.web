"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

        // Fetch user info from user_info table using the correct column name
        const { data: userInfo, error } = await supabase
          .from('user_info')
          .select('first_name, last_name')
          .eq('user_id', data.userId) // Changed from 'id' to 'user_id'
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