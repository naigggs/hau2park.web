"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2, UserPlus } from "lucide-react";
import { createNewUser } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await createNewUser(formData);
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully",
        });
        form.reset();
        setOpen(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form fields without the submit button
  const FormFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" placeholder="John" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" placeholder="Doe" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Enter a strong password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm Password</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          placeholder="Re-enter your password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
        <Input id="vehiclePlateNumber" name="vehiclePlateNumber" placeholder="ABC-1234" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone No.</Label>
        <Input id="phone" name="phone" placeholder="09123456789" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Guest">Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  // Submit button
  const SubmitButton = (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Account
        </>
      )}
    </Button>
  );

  // Render as drawer for mobile
  if (isMobile) {
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <PlusCircle className="mr-1 h-4 w-4" />
          Add New Account
        </Button>
        
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <form onSubmit={handleSubmit}>
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-xl font-semibold">Add New Account</DrawerTitle>
                <DrawerDescription>
                  Create a new user account with specific role
                </DrawerDescription>
              </DrawerHeader>
              
              {/* Scrollable area for form fields */}
              <div className="px-5 overflow-y-auto max-h-[calc(100vh-280px)]">
                <div className="space-y-4 pb-4">
                  {FormFields}
                </div>
              </div>
              
              {/* Fixed footer with submit and cancel buttons */}
              <DrawerFooter className="border-t px-4 py-4 bg-background">
                <div className="flex flex-col gap-2 w-full">
                  {SubmitButton}
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Render as dialog for desktop
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-1 h-4 w-4" />
          Add New Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {FormFields}
          </div>
          
          <DialogFooter className="pt-4 border-t mt-4">
            {SubmitButton}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}