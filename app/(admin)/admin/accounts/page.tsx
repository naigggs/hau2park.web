"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle, Search, Pencil, UserIcon, Mail, Car, Shield } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";

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
  phone: string;
}

export default function AccountsList() {
  const { users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<UserWithRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.vehicle_plate_number?.toLowerCase().includes(searchLower) ||
      user.role_name.toLowerCase().includes(searchLower)
    );
  });

  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Listen for resize events
    window.addEventListener("resize", checkIsMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case "Admin": return "default";
      case "Staff": return "secondary";
      case "User": return "outline";
      default: return "destructive";
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case "Admin": 
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Staff": 
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "User": 
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: 
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  // Mobile card view component
  const MobileView = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((account) => (
          <Card key={account.user_id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {account.first_name} {account.last_name}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md uppercase ${getRoleBadgeClass(account.role_name)}`}>
                    {account.role_name}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">{account.email}</span>
                </div>

                {account.vehicle_plate_number && (
                  <div className="flex items-center text-sm">
                    <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{account.vehicle_plate_number}</span>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <DeleteAccountDialog
                    id={account.user_id}
                    name={account.first_name}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No accounts found matching your search.
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Desktop table view component
  const DesktopView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vehicle Plate Number</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((account) => (
              <TableRow key={account.user_id}>
                <TableCell className="font-medium">
                  {account.first_name} {account.last_name}
                </TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.vehicle_plate_number}</TableCell>
                <TableCell>
                  <Badge
                    className="uppercase"
                    variant={getRoleBadgeVariant(account.role_name)}
                  >
                    {account.role_name}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No accounts found matching your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Accounts</h2>
      </div>
      
      {/* Search and Add Controls - Responsive Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        {/* Mobile Add Button - Fixed by removing className from AddAccountDialog */}
        <div className="w-full sm:w-auto">
          <AddAccountDialog />
        </div>
      </div>
      
      {/* Conditional rendering based on screen size */}
      <div className="md:hidden">
        <MobileView />
      </div>
      
      <div className="hidden md:block">
        <DesktopView />
      </div>
      
      {/* Edit Account Dialog - Works with both views */}
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