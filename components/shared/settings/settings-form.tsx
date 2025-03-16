"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().regex(/^\d+$/, "Phone number must contain only digits").optional(),
  vehicle_plate_number: z
    .string()
    .min(5, "Vehicle plate number must be at least 5 characters"),
});

export function SettingsForm({ userRole }: { userRole: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      vehicle_plate_number: "",
    },
  });

  // Fetch user data when component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        // First get the user ID
        const userIdRes = await fetch("/api/auth/getUserId");
        const userIdData = await userIdRes.json();

        // Then fetch user info using the ID
        const userInfoRes = await fetch(`/api/auth/getUser`);
        const userInfo = await userInfoRes.json();

        if (userInfo) {
          form.reset({
            firstName: userInfo.first_name || "",
            lastName: userInfo.last_name || "",

            phone: userInfo.phone || "",
            vehicle_plate_number: userInfo.vehicle_plate_number || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data. Please try again later.",
        });
      }
    }

    fetchUserData();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/auth/updateUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user information");
      }

      toast({
        title: `${
          userRole.charAt(0).toUpperCase() + userRole.slice(1)
        } Settings Updated`,
        description: "Your information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user information. Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_plate_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Plate Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
