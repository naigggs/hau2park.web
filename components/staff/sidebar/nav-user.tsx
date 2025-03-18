"use client";

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";
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
import Link from "next/link";

export function NavUser() {
  const { isMobile, setOpenMobile } = useSidebar();
  const supabase = createClient();

  const [user, setUser] = useState<User>();
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch(`/api/auth/getUser`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        if (data) {
          setUser(data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      }
    }

    fetchUserInfo();
  }, []);

  // Function to handle navigation item clicks
  const handleNavClick = () => {
    // Only close the sidebar on mobile
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
                <AvatarImage src={user?.avatar} alt={user?.first_name} />
                <AvatarFallback className="rounded-lg">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <>
                  <span className="truncate font-semibold">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </>
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
                <AvatarImage src={user?.avatar} alt={user?.first_name} />
                  <AvatarFallback className="rounded-lg">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                <>
                  <span className="truncate font-semibold">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </>
              </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/staff/settings" onClick={handleNavClick}>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Settings
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (isMobile) {
                  setOpenMobile(false);
                }
                const { error } = await supabase.auth.signOut();
                if (error) {
                  console.error("Error logging out:", error.message);
                } else {
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