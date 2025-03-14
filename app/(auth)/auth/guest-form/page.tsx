"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/landing/header";
import { GuestForm } from "@/components/auth/guest-form";
import Image from "next/image";

// Component that uses useSearchParams
function GuestFormContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [hasShownToast, setHasShownToast] = useState(false);
  
  // Show toast based on URL parameters
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
      <Header />
      
      <div className="flex-grow grid lg:grid-cols-2">
        <div className="flex flex-col gap-6 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
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

// Main page component with Suspense boundary
export default function GuestFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <GuestFormContent />
    </Suspense>
  );
}