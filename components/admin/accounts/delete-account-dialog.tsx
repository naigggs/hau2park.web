import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";

export default function DeleteAccountDialog({ id, name }: { id: string; name: string }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
  
    const handleDelete = async () => {
      setIsLoading(true);
      try {
        const response = await deleteUser(id);
        
        if (response.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.error,
          });
        } else {
          toast({
            title: "Success",
            description: "Account deleted successfully",
          });
          setOpen(false);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete account",
        });
      } finally {
        setIsLoading(false);
      }
    }
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this account?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the account for {name} and remove their data from
              our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }