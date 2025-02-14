"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import DeleteAccountDialog from "@/components/admin/accounts/delete-account-dialog";
import { useUsers } from "@/hooks/use-fetch-accounts";
import { AddAccountDialog } from "@/components/admin/accounts/add-account-dialog";
import { EditAccountDialog } from "@/components/admin/accounts/edit-account-dialog";

interface UserWithRole {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  vehicle_plate_number: string;
  role_name: string;
}

export default function AccountsList() {
  const { users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<UserWithRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Manage Accounts</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <AddAccountDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vehicle Plate Number</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((account) => (
            <TableRow key={account.user_id}>
              <TableCell className="font-medium">
                {account.first_name} {account.last_name}
              </TableCell>
              <TableCell>{account.email}</TableCell>
              <TableCell>{account.vehicle_plate_number}</TableCell>
              <TableCell>
                <Badge
                  className="uppercase"
                  variant={
                    account.role_name === "Admin"
                      ? "default"
                      : account.role_name === "Staff"
                      ? "secondary"
                      : account.role_name === "User"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {account.role_name}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteAccountDialog
                    id={account.user_id}
                    name={account.first_name}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedAccount && (
        <EditAccountDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialData={selectedAccount}
        />
      )}
    </div>
  );
}
