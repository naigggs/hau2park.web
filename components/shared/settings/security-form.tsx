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
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/shared/loading/spinner";
import { Check, X, Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DrawerClose } from "@/components/ui/drawer";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = form.watch("newPassword");

  // Check password strength
  useEffect(() => {
    const minLength = newPassword.length >= 6;
    const upperCase = /[A-Z]/.test(newPassword);
    const number = /[0-9]/.test(newPassword);
    const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    setHasMinLength(minLength);
    setHasUpperCase(upperCase);
    setHasNumber(number);
    setHasSymbol(symbol);
    
    let strength = 0;
    if (minLength) strength += 25;
    if (upperCase) strength += 25;
    if (number) strength += 25;
    if (symbol) strength += 25;
    
    setPasswordStrength(strength);
  }, [newPassword]);

  useEffect(() => {
    async function fetchUserEmail() {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          form.setValue('email', user.email || '');
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user email. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserEmail();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/auth/updateSecurity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        // Special handling for incorrect password
        if (response.status === 401) {
          form.setError("currentPassword", {
            type: "manual",
            message: "Current password is incorrect"
          });
          throw new Error("Current password is incorrect");
        }
        throw new Error(data.message || "Failed to update security settings");
      }
  
      toast({
        title: "Security Settings Updated",
        description: "Your security information has been updated successfully.",
      });
      
      // Reset the password fields
      form.reset({
        ...form.getValues(),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update security settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render until we know if it's mobile or not
  if (isMobile === null) {
    return null;
  }

  // Define form content as a variable instead of a function component to prevent focus loss
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="security-form" className={`space-y-6 ${isMobile ? 'w-full px-0' : ''}`}>
        {!dataLoaded ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="md" />
            <span className="ml-3 text-sm text-muted-foreground">Loading your information...</span>
          </div>
        ) : (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your.email@example.com" 
                      {...field} 
                      className="transition-all focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t border-border my-6"></div>

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Current Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showCurrentPassword ? "text" : "password"} 
                        placeholder="Enter your current password" 
                        {...field} 
                        className="pr-10 transition-all focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showNewPassword ? "text" : "password"} 
                        placeholder="Create a strong password" 
                        {...field} 
                        className="pr-10 transition-all focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <div className="mt-2">
                    <Progress 
                      value={passwordStrength} 
                      className="h-1" 
                      style={{
                        backgroundColor: 
                          passwordStrength <= 25 ? "rgb(239, 68, 68)" : 
                          passwordStrength <= 50 ? "rgb(249, 115, 22)" : 
                          passwordStrength <= 75 ? "rgb(234, 179, 8)" : "rgb(34, 197, 94)"
                      }}
                    />
                    <div className={`mt-2 ${isMobile ? 'grid grid-cols-1 gap-1' : 'grid grid-cols-2 gap-x-4 gap-y-1'} text-xs`}>
                      <div className="flex items-center gap-2">
                        {hasMinLength ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>At least 6 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasUpperCase ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasNumber ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>One number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasSymbol ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
                  
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Confirm your new password" 
                        {...field} 
                        className="pr-10 transition-all focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Only show the button in the form for mobile view */}
        {isMobile && (
          <div className="sticky bottom-0 left-0 right-0 pb-4 pt-4 bg-white border-t flex flex-col gap-3 w-full mt-6">
            <Button 
              type="submit" 
              disabled={isLoading || !form.formState.isDirty || !dataLoaded}
              className="transition-all w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Spinner size="sm" className="text-white" />
                  Updating...
                </span>
              ) : (
                "Update Security Settings"
              )}
            </Button>
            <DrawerClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
              >
                Cancel
              </Button>
            </DrawerClose>
          </div>
        )}
      </form>
    </Form>
  );
              
  // In drawer mode (mobile), render the form in a container similar to SettingsForm
  if (isMobile) {
    return (
      <div className="p-0 h-full flex flex-col">
        <div className="flex-1 overflow-auto px-4 py-4">
          {formContent}
        </div>
      </div>
    );
  }
              
  // For desktop, wrap the form in a Card and add animation
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative pb-16">
          <CardContent className="pt-6 pb-2">
            {formContent}
          </CardContent>
          <CardFooter className="absolute bottom-0 right-0 p-4 flex justify-end">
            <Button
              type="submit"
              form="security-form"
              disabled={isLoading || !form.formState.isDirty || !dataLoaded}
              className="transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" className="text-white" />
                  Updating...
                </span>
              ) : (
                "Update Security Settings"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}