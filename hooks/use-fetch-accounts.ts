"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseUsersState {
  users: UserWithRole[];
  loading: boolean;
  error: string | null;
}

interface UserWithRole {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  vehicle_plate_number: string;
  role_name: string;
}

export function useUsers() {
  const supabase = createClient();
  const [data, setData] = useState<UseUsersState>({
    users: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let userInfoChannel: RealtimeChannel;
    let userRolesChannel: RealtimeChannel;

    const fetchUsers = async () => {
      setData((prev) => ({ ...prev, loading: true }));

      try {
        const [{ data: users, error: userError }, { data: roles, error: roleError }] = 
          await Promise.all([
            supabase.from("user_info").select("*"),
            supabase.from("user_roles").select("*")
          ]);

        if (userError) throw userError;
        if (roleError) throw roleError;

        const usersWithRoles: UserWithRole[] = users.map((user) => {
          const role = roles.find((r) => r.user_id === user.user_id);
          return { ...user, role_name: role ? role.role : "Unknown" };
        });

        setData({ users: usersWithRoles, loading: false, error: null });

        // Subscribe to realtime changes
        userInfoChannel = supabase
          .channel('user_info_changes')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'user_info' 
            }, 
            async (payload) => {
              const { data: newRole } = await supabase
                .from("user_roles")
                .select("*")
                .eq("user_id", payload.new.user_id)
                .single();

              setData(prev => ({
                ...prev,
                users: [...prev.users, { ...payload.new as UserWithRole, role_name: newRole?.role || "Unknown" }]
              }));
            }
          )
          .on('postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'user_info'
            },
            (payload) => {
              setData(prev => ({
                ...prev,
                users: prev.users.filter(user => user.user_id !== payload.old.user_id)
              }));
            }
          )
          .on('postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_info'
            },
            (payload) => {
              setData(prev => ({
                ...prev,
                users: prev.users.map(user => 
                  user.user_id === payload.new.user_id 
                    ? { ...user, ...payload.new }
                    : user
                )
              }));
            }
          )
          .subscribe();

        userRolesChannel = supabase
          .channel('user_roles_changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'user_roles' 
            }, 
            (payload) => {
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                setData(prev => ({
                  ...prev,
                  users: prev.users.map(user => 
                    user.user_id === payload.new.user_id 
                      ? { ...user, role_name: payload.new.role }
                      : user
                  )
                }));
              }
            }
          )
          .subscribe();

      } catch (error: any) {
        setData({ users: [], loading: false, error: error.message });
      }
    };

    fetchUsers();

    // Cleanup subscriptions
    return () => {
      if (userInfoChannel) userInfoChannel.unsubscribe();
      if (userRolesChannel) userRolesChannel.unsubscribe();
    };
  }, []);

  return data;
}
