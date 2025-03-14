"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/landing/header";
import { GuestForm } from "@/components/auth/guest-form";
import Image from "next/image";

export default function GuestFormPage() {
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
      
      <div className="flex-grow grid lg:grid-cols-2">
        <div className="flex flex-col gap-6 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            {/* Constrain the form width for a narrower mobile layout */}
            <div className="w-[80%] max-w-xs mx-auto py-10">
              <div className="h-px w-full bg-border mb-6 lg:hidden"></div>
              <GuestForm />
              <div className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
                © {new Date().getFullYear()} HAU2PARK
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block overflow-hidden">
          {/* Image overlay for desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
          
          <Image
            src="/guest-form.png"
            width={1000}
            height={2000}
            alt="Guest Form"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
            priority
          />
          
          <div className="absolute bottom-10 left-10 z-20 max-w-md">
            <h2 className="text-white text-3xl font-bold mb-2">HAU2PARK</h2>
            <p className="text-gray-200 text-sm">
            The smart parking management solution for Holy Angel University
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}