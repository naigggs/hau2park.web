"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/components/shared/settings/settings-form";
import { SecurityForm } from "@/components/shared/settings/security-form";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings Management</h1>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <SettingsForm userRole="admin" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <SecurityForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
