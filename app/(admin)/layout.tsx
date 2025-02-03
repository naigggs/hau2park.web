import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "@/app/shared/css/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/admin/sidebar/app-sidebar";
import Header from "@/components/admin/header/header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

// async function checkAdminAccess() {
//   const supabase = await createClient();

//   // Get current user
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login");
//   }

//   // Check user role
//   const { data: roleData } = await supabase
//     .from("user-roles")
//     .select("role_id")
//     .eq("user_id", user.id)
//     .single();

//   if (!roleData || roleData.role_id !== 3) {
//     redirect("/");
//   }
// }

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // await checkAdminAccess();

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {children}
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
