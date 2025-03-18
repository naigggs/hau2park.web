"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2, UserCog } from "lucide-react";
import { updateUser } from "@/app/api/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    vehicle_plate_number: string;
    role_name: string;
    phone: string;
  };
}

export function EditAccountDialog({ open, onOpenChange, initialData }: EditAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialData);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role_name: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await updateUser(formDataToSend);
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Account updated successfully",
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
          <Input 
            id="first_name" 
            name="first_name" 
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Enter first name"
            required 
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-sm font-medium">Last Name</Label>
          <Input 
            id="last_name" 
            name="last_name" 
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Enter last name"
            required 
            className="h-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <Input 
          id="email" 
          name="email" 
          value={formData.email}
          disabled
          className="h-10 bg-muted/50"
        />
        <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="vehicle_plate_number" className="text-sm font-medium">Vehicle Plate Number</Label>
        <Input 
          id="vehicle_plate_number" 
          name="vehicle_plate_number" 
          value={formData.vehicle_plate_number}
          onChange={handleChange}
          placeholder="Enter vehicle plate number"
          required 
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone" 
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          required 
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium">Role</Label>
        <Select name="role" value={formData.role_name} onValueChange={handleRoleChange} required>
          <SelectTrigger className="h-10">
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
      <Button type="submit" className="w-full h-10 mt-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <UserCog className="mr-2 h-4 w-4" />
            Update Account
          </>
        )}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCog className="h-4 w-4 text-primary" />
              </div>
              Edit Account
            </DrawerTitle>
            <DrawerDescription>
              Update user account information
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-1 overflow-y-auto max-h-[70vh] pb-2">
            {FormContent}
          </div>
          <DrawerFooter className="pt-4">
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCog className="h-4 w-4 text-primary" />
            </div>
            Edit Account
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {FormContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}