'use client'

import { useState } from "react"
import { Shield, Users, NotebookPen, UserCheck, Check, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUsers } from "@/hooks/use-fetch-accounts"
import { usePendingApprovals } from "@/hooks/use-pending-approvals"
import { AddAccountDialog } from "@/components/admin/accounts/add-account-dialog"
import { EditAccountDialog } from "@/components/admin/accounts/edit-account-dialog"
import DeleteAccountDialog from "@/components/admin/accounts/delete-account-dialog"
import ApprovalActionDialog from "@/components/admin/accounts/approval-action-dialog"

// Types from the existing file
interface UserWithRole {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  vehicle_plate_number: string;
  role_name: string;
  phone: string;
}

interface ApprovalAction {
  id: number;
  userId: string;
  name: string;
  type: "approve" | "reject";
}

export default function AccountsList() {
  const { users, loading, error } = useUsers();
  const { approvals, loading: approvalsLoading, error: approvalsError } = usePendingApprovals();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedAccount, setSelectedAccount] = useState<UserWithRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<ApprovalAction | null>(null);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.vehicle_plate_number?.toLowerCase().includes(searchLower) ||
      user.role_name.toLowerCase().includes(searchLower)
    );
  });

  // Helper function for role badge styling
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Staff":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "User":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "Guest":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  // Mobile user list component
  const MobileUsersList = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-muted-foreground">
          Error loading users
        </div>
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((account) => (
          <Card key={account.user_id}>
            <CardContent className="p-0">
              <div className="p-4 border-b space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {account.first_name} {account.last_name}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md uppercase ${getRoleBadgeClass(account.role_name)}`}>
                    {account.role_name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {account.email}
                </div>
                <div className="text-sm">
                  Plate: {account.vehicle_plate_number}
                </div>
                {account.phone && (
                  <div className="text-sm">
                    Phone: {account.phone}
                  </div>
                )}
              </div>
              <div className="p-3 bg-muted/50 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAccount(account);
                    setIsEditDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <DeleteAccountDialog id={account.user_id} name={account.first_name} />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No accounts found matching your search.
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Desktop user list component
  const DesktopUsersList = () => (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vehicle Plate</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
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
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                Error loading users
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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md uppercase ${getRoleBadgeClass(account.role_name)}`}>
                    {account.role_name}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAccount(account);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <DeleteAccountDialog id={account.user_id} name={account.first_name} />
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
    <motion.div 
      className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Management</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Manage user accounts and approve new sign-ups
          </p>
        </div>
        <AddAccountDialog />
      </div>
      
      {/* Mobile View: Tabs */}
      <div className="block md:hidden">
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>Approvals</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Accounts</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Pending Sign-ups</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-4 space-y-4">
                    {approvalsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : approvals.length > 0 ? (
                      approvals.map((approval) => (
                        <Card key={approval.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {approval.first_name} {approval.last_name}
                              </span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {approval.email}
                            </div>
                            <div className="text-sm">
                              {approval.vehicle_plate_number}
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setApprovalAction({
                                    id: approval.id,
                                    userId: approval.user_id,
                                    name: `${approval.first_name} ${approval.last_name}`,
                                    type: "reject",
                                  });
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setApprovalAction({
                                    id: approval.id,
                                    userId: approval.user_id,
                                    name: `${approval.first_name} ${approval.last_name}`,
                                    type: "approve",
                                  });
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {approvalsError ? "Error loading approvals" : "No pending approvals"}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accounts" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">All Accounts</CardTitle>
                  <div className="relative w-[180px]">
                    <Input
                      placeholder="Search accounts"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-2"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-4">
                    <MobileUsersList />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop View: Side by Side */}
      <div className="hidden md:flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <CardTitle>Pending Sign-ups</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="">
              <div className="space-y-4">
                {approvalsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : approvals.length > 0 ? (
                  approvals.map((approval) => (
                    <Card key={approval.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {approval.first_name} {approval.last_name}
                          </span>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {approval.email}
                        </div>
                        <div className="text-sm">
                          {approval.vehicle_plate_number}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setApprovalAction({
                                id: approval.id,
                                userId: approval.user_id,
                                name: `${approval.first_name} ${approval.last_name}`,
                                type: "reject",
                              });
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setApprovalAction({
                                id: approval.id,
                                userId: approval.user_id,
                                name: `${approval.first_name} ${approval.last_name}`,
                                type: "approve",
                              });
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {approvalsError ? "Error loading approvals" : "No pending approvals"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>All Accounts</CardTitle>
              </div>
              <div className="relative w-[180px]">
                <Input
                  placeholder="Search accounts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-2"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="">
              <div className="pr-4">
                <DesktopUsersList />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {selectedAccount && (
        <EditAccountDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          initialData={selectedAccount}
        />
      )}
      {approvalAction && (
        <ApprovalActionDialog
          open={!!approvalAction}
          onOpenChange={() => setApprovalAction(null)}
          signupId={approvalAction.id}
          userId={approvalAction.userId}
          name={approvalAction.name}
          action={approvalAction.type}
        />
      )}
    </motion.div>
  )
}
