"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/components/shared/settings/settings-form";
import { SecurityForm } from "@/components/shared/settings/security-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { User, Shield, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SettingsPage() {
  const [activeDrawer, setActiveDrawer] = useState<"profile" | "security" | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="container px-4 md:px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">Guest Settings Management</h1>

      {isMobile ? (
        // Mobile view - Cards that open drawers
        <div className="space-y-6">
          <Drawer open={activeDrawer === "profile"} onOpenChange={(open) => setActiveDrawer(open ? "profile" : null)}>
            <DrawerTrigger asChild>
              <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                <CardContent className="p-6 py-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Profile Settings</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manage your personal information, contact details, and vehicle information
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <DrawerHeader>
                <DrawerTitle className="text-xl font-semibold">Profile Settings</DrawerTitle>
                <DrawerDescription>
                  Manage your personal information and contact details
                </DrawerDescription>
              </DrawerHeader>
              <ScrollArea className="px-4 h-full pb-8">
                <div className="pb-2">
                  <SettingsForm userRole="admin" />
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>

          <Drawer open={activeDrawer === "security"} onOpenChange={(open) => setActiveDrawer(open ? "security" : null)}>
            <DrawerTrigger asChild>
              <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                <CardContent className="p-6 py-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Security Settings</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manage your password, email, and account security preferences
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <DrawerHeader>
                <DrawerTitle className="text-xl font-semibold">Security Settings</DrawerTitle>
                <DrawerDescription>
                  Update your password, email and security preferences
                </DrawerDescription>
              </DrawerHeader>
              <ScrollArea className="px-4 h-full pb-8">
                <div className="pb-2">
                  <SecurityForm />
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>
      ) : (
        // Desktop view - 2 columns side by side
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Profile Settings</h2>
              </div>
              <SettingsForm userRole="admin" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Security Settings</h2>
              </div>
              <SecurityForm />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}