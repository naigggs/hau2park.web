"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "./types";

export function NavUser() {
  const { isMobile } = useSidebar();
  const supabase = createClient();

  // const [user, setUser] = useState<User>();
  // const [error, setError] = useState("");

  // useEffect(() => {
  //   async function fetchUserInfo() {
  //     try {
  //       const response = await fetch(`/api/user`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch user data");
  //       }
  //       const data = await response.json();
  //       if (data && data.length > 0) {
  //         setUser(data[0]); // Set the first user object from the array
  //       }
  //     } catch (err) {
  //       setError(
  //         err instanceof Error ? err.message : "An unknown error occurred"
  //       );
  //     }
  //   }

  //   fetchUserInfo();
  // }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/* <AvatarImage src={user?.avatar} alt={user?.name} /> */}
                <AvatarFallback className="rounded-lg">
                 {/* {user?.full_name[0]} */}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {/* {user ? (
                  <>
                    <span className="truncate font-semibold">
                      {user.full_name}
                    </span>
                    <span className="truncate text-xs">{user.location}</span>
                  </>
                ) : (
                  <span className="truncate font-light">Loading...</span>
                )} */}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={user?.avatar} alt={user?.name} /> */}
                  <AvatarFallback className="rounded-lg">
                  {/* {user?.full_name[0]} */}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {/* {user ? (
                    <>
                      <span className="truncate font-semibold">
                      {user.full_name}
                      </span>
                      <span className="truncate text-xs">{user.location}</span>
                    </>
                  ) : (
                    <span className="truncate font-light">Loading...</span>
                  )} */}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  console.error("Error logging out:", error.message);
                } else {
                  // Redirect to login page or perform other actions after logout
                  window.location.href = "/auth/login";
                }
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
