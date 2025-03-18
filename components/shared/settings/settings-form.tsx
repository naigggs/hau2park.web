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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/shared/loading/spinner";
import { User, Smartphone, Car } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DrawerClose } from "@/components/ui/drawer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "First name must contain only letters and spaces"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Last name must contain only letters and spaces"),
  phone: z
    .string()
    .regex(/^\d+$/, "Phone number must contain only digits")
    .optional()
    .transform(val => val === "" ? undefined : val),
  vehicleLetters: z
    .string()
    .min(2, "Vehicle plate letters must be at least 2 characters")
    .max(3, "Vehicle plate letters cannot exceed 3 characters")
    .regex(/^[A-Z]+$/, "Must contain only uppercase letters"),
  vehicleNumbers: z
    .string()
    .min(1, "Vehicle plate numbers required")
    .max(4, "Vehicle plate numbers cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "Must contain only numbers"),
});

// This is a derived type that extends the form schema with a combined field
type FormValues = z.infer<typeof formSchema>;
// The actual API values contain the combined vehicle_plate_number
interface ApiValues extends Omit<FormValues, 'vehicleLetters' | 'vehicleNumbers'> {
  vehicle_plate_number: string;
}

export function SettingsForm({ userRole }: { userRole: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  // Set initial state to null to prevent flickering
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Detect mobile view with proper lifecycle handling
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    
    function handleResize(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }
    
    mql.addEventListener("change", handleResize);
    return () => mql.removeEventListener("change", handleResize);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      vehicleLetters: "",
      vehicleNumbers: "",
    },
    mode: "onChange",
  });

  // Watch form values to detect changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (dataLoaded) {
        setFormChanged(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, dataLoaded]);

  // Fetch user data when component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        // First get the user ID
        const userIdRes = await fetch("/api/auth/getUserId");
        const userIdData = await userIdRes.json();

        // Then fetch user info using the ID
        const userInfoRes = await fetch(`/api/auth/getUser`);
        const userInfo = await userInfoRes.json();

        if (userInfo) {
          // Split the vehicle plate number into letters and numbers
          let vehicleLetters = "";
          let vehicleNumbers = "";
          
          if (userInfo.vehicle_plate_number) {
            // This regex will find letters at the start and numbers at the end
            const plateMatch = userInfo.vehicle_plate_number.match(/^([A-Z]+)\s*(\d+)$/);
            if (plateMatch) {
              vehicleLetters = plateMatch[1] || "";
              vehicleNumbers = plateMatch[2] || "";
            }
          }
          
          // Process the phone number to remove the "63" prefix if present
          let phoneNumber = userInfo.phone ? String(userInfo.phone) : "";
          if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.startsWith("63")) {
            phoneNumber = phoneNumber.substring(2);
          }
          
          form.reset({
            firstName: userInfo.first_name || "",
            lastName: userInfo.last_name || "",
            phone: phoneNumber,
            vehicleLetters,
            vehicleNumbers,
          });
          setDataLoaded(true);
          setFormChanged(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [form]);

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      
      // Combine vehicle plate parts for API submission
      const apiValues: ApiValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        // Add the 63 prefix only if it's not already there
        phone: values.phone ? (values.phone.startsWith("63") ? values.phone : `63${values.phone}`) : undefined,
        vehicle_plate_number: `${values.vehicleLetters} ${values.vehicleNumbers}`.trim(),
      };
      
      const response = await fetch(`/api/auth/updateUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiValues),
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
      setFormChanged(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user information. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render until we know if it's mobile or not
  if (isMobile === null) {
    return null;
  }

  // Form for both mobile and desktop views
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="settings-form" className={`space-y-6 ${isMobile ? 'w-full' : ''}`}>
        {!dataLoaded ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="md" />
            <span className="ml-3 text-sm text-muted-foreground">Loading your information...</span>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`grid gap-6 ${!isMobile ? "sm:grid-cols-2" : ""}`}>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter first name"
                        className="transition-all shadow-sm"
                        {...field}
                      />
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
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter last name"
                        className="transition-all shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Smartphone className="h-4 w-4" />
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md text-gray-700">
                        +63
                      </div>
                      <Input
                        type="tel"
                        placeholder="9123456789"
                        className="pl-14 transition-all shadow-sm"
                        value={field.value || ""}
                        onChange={(e) => {
                          // Just store the raw input number without the prefix
                          const inputValue = e.target.value.replace(/\D/g, "");
                          field.onChange(inputValue);
                        }}
                        maxLength={10}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Enter your 10-digit phone number starting with 9
                    (e.g., 9123456789)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle Plate Number */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <Car className="h-4 w-4" />
                Vehicle Plate Number
              </FormLabel>

              {/* Horizontal layout with inputs on left, preview on right */}
              <div className="flex flex-col sm:flex-row items-center justify-center mt-3 gap-4">
                <div className="flex items-center">
                  {/* Input fields container */}
                  <div className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-20">
                      <FormField
                        control={form.control}
                        name="vehicleLetters"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              placeholder="AAA"
                              className="transition-all uppercase text-center font-bold border-gray-300 bg-gray-50"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase();
                                field.onChange(value);
                              }}
                              maxLength={3}
                            />
                          </FormControl>
                        )}
                      />
                    </div>

                    <div className="h-1 w-3 bg-gray-300 rounded-full mx-2"></div>

                    <div className="w-20">
                      <FormField
                        control={form.control}
                        name="vehicleNumbers"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              placeholder="1234"
                              className="transition-all text-center font-bold border-gray-300 bg-gray-50"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                field.onChange(value);
                              }}
                              maxLength={4}
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                  </div>

                  {/* Preview directly next to the inputs */}
                  <div className="ml-4">
                    <div className="px-3 py-1.5 border border-gray-200 rounded-md bg-white whitespace-nowrap font-mono shadow-sm">
                      {form.watch("vehicleLetters") || "AAA"} {form.watch("vehicleNumbers") || "1234"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed height container for validation messages */}
              <div className="h-6 mt-2 text-center">
                {form.formState.errors.vehicleLetters && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.vehicleLetters.message}
                  </p>
                )}
                {form.formState.errors.vehicleNumbers && !form.formState.errors.vehicleLetters && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.vehicleNumbers.message}
                  </p>
                )}
              </div>

              {/* Description text always at bottom */}
              <FormDescription className="text-xs text-center mt-1 ">
                Enter your vehicle plate number in the format AAA 1234
              </FormDescription>
            </div>
          </div>
        )}

        {isMobile && (
          <div className="sticky bottom-0 left-0 right-0 pb-4 pt-4 bg-white border-t flex flex-col gap-3 w-full mt-6">
            <Button
              type="submit"
              disabled={isLoading || !formChanged || !dataLoaded}
              className="transition-all w-full bg-black hover:bg-gray-800"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Spinner size="sm" className="text-white" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <DrawerClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
            </DrawerClose>
          </div>
        )}
      </form>
    </Form>
  );

  // In drawer mode (mobile), we need a different layout
  if (isMobile) {
    return (
      <div className="p-0 h-full flex flex-col">
        <div className="flex-1 overflow-auto px-4 py-4">
          {formContent}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative pb-16 border-gray-200 shadow-sm">
          <CardContent className="pt-6 pb-2">
            {formContent}
          </CardContent>
          <CardFooter className="absolute bottom-0 right-0 p-4 flex justify-end">
            <Button
              type="submit"
              form="settings-form"
              disabled={isLoading || !formChanged || !dataLoaded}
              className="transition-all bg-black hover:bg-gray-800"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" className="text-white" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}