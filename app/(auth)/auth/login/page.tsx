"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/landing/header";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CarFront } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [hasShownToast, setHasShownToast] = useState(false);
  
  // Forced immediate toast if URL has the parameter
  useEffect(() => {
    // Check if we've already shown the toast to avoid duplicates
    if (hasShownToast) return;
    
    // Check URL directly as a first approach
    const urlParams = new URLSearchParams(window.location.search);
    const registeredParam = urlParams.get('registered');
    const messageParam = urlParams.get('message');
    
    // Check for registered flag in localStorage 
    const storedSuccess = localStorage.getItem('registrationSuccess');
    
    // If any of these flags are present, show the toast
    if ((registeredParam === 'true' || 
         messageParam === 'Registration pending approval' ||
         storedSuccess === 'true') && 
        !hasShownToast) {
      
      // Show toast with delay to ensure components are mounted
      setTimeout(() => {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created and is awaiting admin approval. You will receive an email when your account is approved.",
          className: "bg-green-500 text-white",
          duration: 10000, // 10 seconds
        });
        
        // Clean up storage
        localStorage.removeItem('registrationSuccess');
        
        // Mark that we've shown the toast
        setHasShownToast(true);
      }, 500);
    }
  }, [toast, hasShownToast]);
  
  // Also show toast based on Next.js router params (backup approach)
  useEffect(() => {
    if (hasShownToast) return;
    
    const justRegistered = searchParams.get('registered') === 'true';
    const serverMessage = searchParams.get('message');
    
    if ((justRegistered || serverMessage === 'Registration pending approval') && !hasShownToast) {
      setTimeout(() => {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created and is awaiting admin approval. You will receive an email when your account is approved.",
          className: "bg-green-500 text-white",
          duration: 10000,
        });
        setHasShownToast(true);
      }, 500);
    }
  }, [searchParams, toast, hasShownToast]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Header from landing page */}
      <Header />
      {/* Login form section */}
      <div className="flex-grow flex items-center justify-center">
        <Card className="mx-4 w-full max-w-6xl overflow-hidden shadow-xl shadow-gray-400/50">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Image (hidden on mobile) */}
            <div className="relative hidden md:block">
              <Image
                src="/login-page.png"
                alt="Scenic campus parking"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay to darken the image */}
              <div className="absolute inset-0 bg-black/40" />
              {/* White text overlay */}
              <div className="absolute bottom-6 left-6 z-10 max-w-[75%] text-white">
                <h2 className="text-xl font-bold mb-1">HAU2PARK</h2>
                <p className="text-sm">
                  The smart parking management solution for Holy Angel University
                </p>
              </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="flex flex-col justify-center px-8 py-12 md:p-10 bg-card text-card-foreground">
              <CardHeader className="mb-4 pb-2 border-b border-border">
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <CarFront className="size-4" />
                  </div>
                  <h1 className="text-lg font-semibold mb-1">HAU2PARK</h1>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 mt-4">
                <LoginForm />
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}