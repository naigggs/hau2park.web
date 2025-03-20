"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Login } from "@/app/api/auth/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/shared/loading/spinner";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Trigger route change events for GlobalLoader
  useEffect(() => {
    if (redirecting) {
      // Create and dispatch custom events that your GlobalLoader listens for
      window.dispatchEvent(new Event("next-route-start"));
      
      // After a delay, initiate the actual redirect
      const timer = setTimeout(() => {
        const redirectUrl = sessionStorage.getItem("redirectUrl") || "/";
        window.location.href = redirectUrl;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [redirecting]);

  function validateForm(email: string, password: string): boolean {
    let isValid = true;
    
    // Reset error states
    setEmailError(null);
    setPasswordError(null);
    setLoginError(null);

    // Validate email (contains @ and .com, .net, etc.)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address (e.g., name@example.com)");
      isValid = false;
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      isValid = false;
    }

    return isValid;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // Validate form before submission
    if (!validateForm(email, password)) {
      if (password.length < 6) {
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: "Password must be at least 6 characters long",
        });
      }
      return;
    }
    
    setLoading(true);
    setLoginError(null);
    
    try {
      // Call the Login server action and handle the structured response
      const result = await Login(formData);
      
      if (result && result.success && result.redirectTo) {
        // Store the redirect URL in sessionStorage
        sessionStorage.setItem("redirectUrl", result.redirectTo);
        
        // Show success toast
        toast({
          title: "Login Success!",
          description: "You have successfully logged in. Redirecting...",
          className: "bg-green-500 text-white",
        });
        
        // Set redirecting state to trigger the global loader
        setRedirecting(true);
      } else if (result && !result.success) {
        // Handle error with specific message
        setLoginError(result.error || "Login failed. Please try again.");
      } else {
        // Unexpected response format
        setLoginError("Login failed. Unexpected response from server.");
      }
    } catch (error: any) {
      // This will catch any unhandled errors
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      if (!redirecting) {
        setLoading(false);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      
      {loginError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="border-red-500/50 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-medium">Authentication Error</AlertTitle>
            <AlertDescription className="text-sm mt-1">{loginError}</AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            onChange={() => setEmailError(null)}
            className={cn(
              emailError ? "border-red-500 focus-visible:ring-red-300" : "",
              "transition-all duration-200"
            )}
          />
          {emailError && (
            <motion.p 
              className="text-xs text-red-500 flex items-center gap-1.5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="h-3 w-3" />
              {emailError}
            </motion.p>
          )}
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a 
              href="/auth/forgot-password" 
              className="text-xs text-primary hover:underline transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required
              minLength={6}
              onChange={() => setPasswordError(null)}
              className={cn(
                passwordError ? "border-red-500 focus-visible:ring-red-300" : "",
                "pr-10 transition-all duration-200"
              )}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <motion.p 
              className="text-xs text-red-500 flex items-center gap-1.5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="h-3 w-3" />
              {passwordError}
            </motion.p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || redirecting}
          variant={redirecting ? "outline" : "default"}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Logging in...
            </span>
          ) : redirecting ? (
            <span className="text-primary">Login Successful</span>
          ) : (
            "Login"
          )}
        </Button>
      </div>
      
      <div className="text-center text-sm">
        Are you a guest?{" "}
        <a href="/auth/guest-form" className="text-primary hover:underline transition-colors">
          Guest Form
        </a>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/auth/register" className="text-primary hover:underline transition-colors">
          Sign up
        </a>
      </div>
    </form>
  );
}