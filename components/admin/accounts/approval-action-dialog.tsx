"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { approveAccount, declineAccount } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCheck, AlertTriangle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signupId: number;
  userId: string;
  name: string;
  action: "approve" | "reject";
}

export default function ApprovalActionDialog({
  open,
  onOpenChange,
  signupId,
  userId,
  name,
  action,
  ...props
}: ApprovalActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleAction = async () => {
    setIsLoading(true);
    try {
      const response = action === "approve" 
        ? await approveAccount(signupId, userId)
        : await declineAccount(signupId);

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      } else {
        toast({
          title: "Success",
          description: `Account ${action === "approve" ? "approved" : "rejected"} successfully`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} account`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dialogContentBody = (
    <>
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
          action === "approve" 
            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {action === "approve" ? (
            <UserCheck className="h-8 w-8" />
          ) : (
            <AlertTriangle className="h-8 w-8" />
          )}
        </div>
        <h2 className="text-xl font-semibold mb-2">
          {action === "approve" ? "Approve" : "Reject"} Account Registration
        </h2>
        <p className="text-muted-foreground">
          Are you sure you want to {action} the account registration for <span className="font-medium text-foreground">{name}</span>?
          {action === "reject" && " This action cannot be undone."}
        </p>
      </div>
    </>
  );

  const FooterContent = (
    <>
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isLoading}
        className="mr-2"
      >
        Cancel
      </Button>
      <Button
        variant={action === "approve" ? "default" : "destructive"}
        onClick={handleAction}
        disabled={isLoading}
        className={action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {action === "approve" ? "Approving..." : "Rejecting..."}
          </>
        ) : (
          action === "approve" ? "Approve" : "Reject"
        )}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl">{action === "approve" ? "Approve" : "Reject"} Account</DrawerTitle>
            <DrawerDescription>Confirm your action</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {dialogContentBody}
          </div>
          <DrawerFooter className="pt-2">
            <div className="flex flex-col gap-3">
              <Button
                variant={action === "approve" ? "default" : "destructive"}
                onClick={handleAction}
                disabled={isLoading}
                className={action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {action === "approve" ? "Approving..." : "Rejecting..."}
                  </>
                ) : (
                  action === "approve" ? "Approve Account" : "Reject Account"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" disabled={isLoading}>Cancel</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {action === "approve" ? "Approve" : "Reject"} Account Registration
          </DialogTitle>
          <DialogDescription className="text-center">
            Confirm your action
          </DialogDescription>
        </DialogHeader>
        {dialogContentBody}
        <DialogFooter className="flex justify-end gap-2 pt-4">
          {FooterContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}