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
import { Button } from "@/components/ui/button";
import { approveAccount, declineAccount } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
}: ApprovalActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "approve" ? "Approve" : "Reject"} Account Registration
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {action} the account registration for {name}?
            {action === "reject" && " This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={action === "approve" ? "default" : "destructive"}
            onClick={handleAction}
            disabled={isLoading}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}