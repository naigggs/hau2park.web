'use client'

import { useState } from "react"
import { Shield, Users, NotebookPen, UserCheck, Check, X, Search, PlusCircle, Eye, Trash2, ChevronDown, ChevronUp, FileImage, ImageIcon, ZoomIn } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUsers } from "@/hooks/use-fetch-accounts"
import { usePendingApprovals } from "@/hooks/use-pending-approvals"
import { AddAccountDialog } from "@/components/admin/accounts/add-account-dialog"
import { EditAccountDialog } from "@/components/admin/accounts/edit-account-dialog"
import DeleteAccountDialog from "@/components/admin/accounts/delete-account-dialog"
import ApprovalActionDialog from "@/components/admin/accounts/approval-action-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { createClient } from "@/utils/supabase/client"

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
  const [selectedIdLink, setSelectedIdLink] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const supabase = createClient();

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
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/10 dark:text-blue-400 dark:border-blue-800/30";
      case "staff":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/10 dark:text-purple-400 dark:border-purple-800/30";
      case "user":
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/10 dark:text-slate-400 dark:border-slate-800/30";
      case "guest":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-800/30";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/10 dark:text-gray-400 dark:border-gray-700/30";
    }
  };

  // Animation variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  // ID Viewer Dialog (used for mobile view)
  const IdViewerDialog = () => (
    <Dialog open={!!selectedIdLink} onOpenChange={() => setSelectedIdLink(null)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg">{selectedName}'s ID Document</DialogTitle>
        </DialogHeader>
        <div className="p-1">
          <div className="rounded-md overflow-hidden bg-muted/10 border flex items-center justify-center">
            <img 
              src={selectedIdLink || ""}
              alt="ID Document" 
              className="max-h-[400px] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/500x300/eee/999?text=ID+Not+Found";
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Mobile user list component
  const MobileUsersList = () => (
    <motion.div 
      className="space-y-3 max-w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-muted-foreground">
          Error loading users
        </div>
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((account) => (
          <motion.div key={account.user_id} variants={item}>
            <Card className="overflow-hidden border-border/40 hover:border-border hover:shadow-sm transition-all">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {account.first_name} {account.last_name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {account.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`font-normal ${getRoleBadgeClass(account.role_name)}`}
                  >
                    {account.role_name}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <div>{account.vehicle_plate_number}</div>
                  {account.phone && <div>{account.phone}</div>}
                </div>
              </CardContent>
              
              <CardContent className="p-0 border-t">
                <div className="flex flex-col">
                  <Button 
                    className="w-full rounded-none h-9 font-medium"
                    variant="ghost"
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </Button>
                  <Button
                    className="w-full rounded-none h-9 font-medium text-destructive hover:bg-destructive/10 border-t"
                    variant="ghost"
                    onClick={() => {
                      document.getElementById(`delete-trigger-${account.user_id}`)?.click();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </Button>
                  <span className="hidden">
                    <DeleteAccountDialog id={account.user_id} name={account.first_name} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-muted-foreground flex flex-col items-center justify-center">
            <Users className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <p>No accounts found</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  // Desktop user list component
  const DesktopUsersList = () => (
    <Card className="border-border/40 shadow-sm rounded-lg">
      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="py-2">User</TableHead>
              <TableHead className="py-2">Vehicle & Contact</TableHead>
              <TableHead className="py-2 w-[90px]">Role</TableHead>
              <TableHead className="text-right py-2 pr-3 w-[110px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                  Error loading users
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((account) => (
                <TableRow key={account.user_id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="py-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {account.first_name} {account.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[240px]">
                          {account.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="space-y-0.5 text-sm">
                      <div>{account.vehicle_plate_number}</div>
                      {account.phone && <div>{account.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge 
                      variant="outline" 
                      className={`font-normal text-xs ${getRoleBadgeClass(account.role_name)}`}
                    >
                      {account.role_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-2 whitespace-nowrap">
                    <div className="flex space-x-1 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account);
                          setIsEditDialogOpen(true);
                        }}
                        className="h-7 w-[60px] text-xs justify-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 justify-center"
                        id={`delete-button-${account.user_id}`}
                        onClick={() => {
                          document.getElementById(`delete-trigger-${account.user_id}`)?.click();
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <span className="hidden">
                        <DeleteAccountDialog id={account.user_id} name={account.first_name} />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-2 text-muted-foreground/50" />
                    <p>No accounts found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  // Pending approvals card
  const PendingApprovalsCard = () => (
    <motion.div 
      className="space-y-3 max-w-full"
      variants={container}
      initial="hidden" 
      animate="show"
    >
      {approvalsLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : approvals.length > 0 ? (
        approvals.map((approval) => (
          <motion.div key={approval.id} variants={item}>
            <Card className="overflow-hidden border-border/40 hover:border-border hover:shadow-sm transition-all">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-sky-50 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <h3 className="font-medium">
                            {approval.first_name} {approval.last_name}
                          </h3>
                          {approval.id_link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-sky-600 dark:text-sky-400"
                              onClick={() => {
                                setSelectedIdLink(approval.id_link);
                                setSelectedName(`${approval.first_name} ${approval.last_name}`);
                              }}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {approval.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/10 dark:text-sky-400 dark:border-sky-800/30 font-normal">
                    Pending
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-muted-foreground">
                    {approval.vehicle_plate_number || "No plate number"}
                  </div>
                </div>
              </CardContent>
              
              <CardContent className="p-0 border-t">
                <div className="grid grid-cols-2 divide-x">
                  <Button 
                    className="rounded-none h-9 font-medium"
                    variant="ghost"
                    onClick={() => {
                      setApprovalAction({
                        id: approval.id,
                        userId: approval.user_id,
                        name: `${approval.first_name} ${approval.last_name}`,
                        type: "reject",
                      });
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-2 text-destructive" />
                    Reject
                  </Button>
                  <Button 
                    className="rounded-none h-9 font-medium"
                    variant="ghost"
                    onClick={() => {
                      setApprovalAction({
                        id: approval.id,
                        userId: approval.user_id,
                        name: `${approval.first_name} ${approval.last_name}`,
                        type: "approve",
                      });
                    }}
                  >
                    <Check className="h-3.5 w-3.5 mr-2 text-primary" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-muted-foreground flex flex-col items-center justify-center">
            <UserCheck className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <p>No pending approvals</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  // Desktop approvals table
  const DesktopApprovalsTable = () => (
    <Card className="border-border/40 shadow-sm rounded-lg mb-4">
      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="py-2">Applicant</TableHead>
              <TableHead className="py-2 w-[120px]">Vehicle</TableHead>
              <TableHead className="py-2 w-[100px]">ID Document</TableHead>
              <TableHead className="text-right py-2 pr-3 w-[130px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvalsLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : approvals.length > 0 ? (
              approvals.map((approval) => (
                <TableRow key={approval.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="py-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-7 w-7 bg-sky-50 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
                        <UserCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {approval.first_name} {approval.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {approval.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    {approval.vehicle_plate_number || "—"}
                  </TableCell>
                  <TableCell className="py-2">
                    {approval.id_link ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <div className="h-14 w-20 border rounded-md overflow-hidden bg-black/5 group cursor-pointer"
                                   onClick={() => {
                                     setSelectedIdLink(approval.id_link);
                                     setSelectedName(`${approval.first_name} ${approval.last_name}`);
                                   }}>
                                <img 
                                  src={approval.id_link}
                                  alt="ID"
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://placehold.co/80x56/eee/999?text=No+ID";
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                  <ZoomIn className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click to view ID</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="h-14 w-20 border rounded-md flex items-center justify-center bg-muted/10 text-muted-foreground">
                        <div className="text-center text-xs">
                          <FileImage className="h-4 w-4 mb-0.5 mx-auto opacity-60" />
                          <span className="opacity-70">No ID</span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-2 whitespace-nowrap text-right">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs justify-center bg-transparent border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                        onClick={() => {
                          setApprovalAction({
                            id: approval.id,
                            userId: approval.user_id,
                            name: `${approval.first_name} ${approval.last_name}`,
                            type: "approve",
                          });
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs justify-center text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => {
                          setApprovalAction({
                            id: approval.id,
                            userId: approval.user_id,
                            name: `${approval.first_name} ${approval.last_name}`,
                            type: "reject",
                          });
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UserCheck className="h-8 w-8 mb-2 text-muted-foreground/50" />
                    <p>No pending approvals</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <motion.div 
      className="flex-1 space-y-5 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Management</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block ml-11">
            Manage user accounts and approve new sign-ups
          </p>
        </div>
        <AddAccountDialog />
      </div>
      
{/* Mobile View: Tabs */}
<div className="block md:hidden">
  <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-2 pt-2">
    <TabsList className="grid w-full grid-cols-2 shadow-sm -mt-4 pb-12 ">
      <TabsTrigger value="pending" className="flex items-center gap-2 py-3 px-4 h-auto">
        <UserCheck className="h-4 w-4" />
        <span>Approvals</span>
      </TabsTrigger>
      <TabsTrigger value="accounts" className="flex items-center gap-2 py-3 px-4 h-auto">
        <Users className="h-4 w-4" />
        <span>Accounts</span>
      </TabsTrigger>
    </TabsList>
    
    <TabsContent value="pending" className="mt-4 flex-1 overflow-hidden">
      <Card className="border-border/40 h-full flex flex-col shadow-sm rounded-lg">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg">Pending Sign-ups</CardTitle>
        </CardHeader>
        <CardContent className="p-4 overflow-auto">
          <PendingApprovalsCard />
        </CardContent>
      </Card>
    </TabsContent>
    
    <TabsContent value="accounts" className="mt-4 flex-1 overflow-hidden">
      <Card className="border-border/40 h-full flex flex-col shadow-sm rounded-lg">
        <CardHeader className="pb-2 border-b">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-lg">All Accounts</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 overflow-auto">
          <MobileUsersList />
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>
      
      {/* Desktop View: Side by Side */}
      <div className="hidden md:flex flex-col lg:flex-row gap-6 h-full">
        <Card className="flex-1 border-border/40 flex flex-col lg:h-full shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden">
          <CardHeader className="pb-2 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="font-semibold">Pending Sign-ups</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-230px)] pr-2">
              {!isMobile ? <DesktopApprovalsTable /> : <PendingApprovalsCard />}
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="flex-1 border-border/40 flex flex-col lg:h-full shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden">
          <CardHeader className="pb-2 border-b bg-muted/20">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="font-semibold">All Accounts</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, role or plate number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-280px)] pr-2">
              <DesktopUsersList />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <IdViewerDialog />
      
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