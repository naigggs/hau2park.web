"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteUser } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DeleteAccountDialogProps {
  id: string;
  name: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DeleteAccountDialog({ 
  id, 
  name, 
  open: controlledOpen, 
  onOpenChange 
}: DeleteAccountDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  // Setup effect to handle external trigger clicks via IDs
  useEffect(() => {
    // Create a handler for the trigger element with this ID
    const triggerHandler = (e: MouseEvent) => {
      setInternalOpen(true);
    };
    
    // Get the trigger element
    const triggerElement = document.getElementById(`delete-trigger-${id}`);
    
    // Add click listener if element exists
    if (triggerElement) {
      triggerElement.addEventListener('click', triggerHandler);
    }
    
    // Clean up
    return () => {
      if (triggerElement) {
        triggerElement.removeEventListener('click', triggerHandler);
      }
    };
  }, [id]);
  
  // Handle state changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };
  
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
        handleOpenChange(false);
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
  };

  const DialogContentComponent = (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <div className="h-16 w-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 dark:bg-red-900/30 dark:text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Delete Account</h2>
      <p className="text-muted-foreground">
        Are you sure you want to delete the account for <span className="font-medium text-foreground">{name}</span>? This action cannot be undone and will permanently remove their data from our servers.
      </p>
    </div>
  );

  // Create visible but hidden elements to accept programmatic clicks
  const hiddenTrigger = (
    <span
      id={`delete-trigger-${id}`}
      className="hidden"
      role="button"
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  if (isMobile) {
    return (
      <>
        {hiddenTrigger}
        
        {!isControlled && (
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none h-11 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleOpenChange(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </Button>
        )}
        
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent>
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-xl">Delete Account</DrawerTitle>
              <DrawerDescription>This action cannot be undone</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              {DialogContentComponent}
            </div>
            <DrawerFooter className="pt-2">
              <div className="flex flex-col gap-3">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </>
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" disabled={isLoading}>Cancel</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {hiddenTrigger}
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!isControlled && (
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Delete Account</DialogTitle>
            <DialogDescription className="text-center">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          {DialogContentComponent}
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}