"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useUsers() {
  const supabase = createClient();
  const [data, setData] = useState<UseUsersState>({
    users: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setData((prev) => ({ ...prev, loading: true }));

      try {
        // Fetch all users from user_info
        const { data: users, error: userError } = await supabase
          .from("user_info")
          .select("*");

        if (userError) throw userError;

        // Fetch all user roles
        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("*");

        if (roleError) throw roleError;

        // Merge users with their roles
        const usersWithRoles: UserWithRole[] = users.map((user) => {
          const role = roles.find((r) => r.user_id === user.user_id);
          return { ...user, role_name: role ? role.role : "Unknown" };
        });

        setData({ users: usersWithRoles, loading: false, error: null });
      } catch (error: any) {
        setData({ users: [], loading: false, error: error.message });
      }
    };

    fetchUsers();
  }, []);

  return data;
}
