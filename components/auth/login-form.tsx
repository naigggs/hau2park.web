"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Login } from "@/app/api/auth/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Spinner } from "@/components/shared/loading/spinner";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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
      // The Login server action will handle the redirection
      // We don't need to do anything with the response
      await Login(formData);
      
      // If we get here, something went wrong with the redirection
      // Show a toast just in case, but we shouldn't normally get here
      toast({
        title: "Login Success!",
        description: "You have successfully logged in. Redirecting...",
        className: "bg-green-500 text-white",
      });
    } catch (error: any) {
      // Handle specific error cases based on error message or code
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (error?.message) {
        if (error.message.includes("pending approval") || 
            error.message.includes("awaiting approval")) {
          errorMessage = "Your account exists but is pending admin approval.";
          setLoginError(errorMessage);
        } else if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
          setLoginError(errorMessage);
        } else {
          // For other errors, use the actual error message
          errorMessage = error.message;
          setLoginError(errorMessage);
        }
      }
      
      // Display toast for all error types
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
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
            className={emailError ? "border-red-500" : ""}
          />
          {emailError && (
            <p className="text-xs text-red-500">{emailError}</p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a 
              href="/auth/forgot-password" 
              className="text-sm text-muted-foreground hover:underline"
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
                passwordError ? "border-red-500" : "",
                "pr-10" // Add padding on the right to accommodate the icon
              )}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-500">{passwordError}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
      </div>
      <div className="text-center text-sm">
        Are you a guest?{" "}
        <a href="/auth/guest-form" className="underline underline-offset-4">
          Guest Form
        </a>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/auth/register" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  );
}