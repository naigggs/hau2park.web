"use client";

import Header from "@/components/shared/landing/header";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CarFront } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Header from landing page */}
      <Header />
      {/* Register form section */}
      <div className="flex-grow flex items-center justify-center">
        <Card className="mx-4 w-full max-w-6xl overflow-hidden shadow-xl shadow-gray-400/50">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Register Form */}
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
                <SignUpForm />
              </CardContent>
            </div>

            {/* Right Column: Image (hidden on mobile) */}
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
          </div>
        </Card>
      </div>
    </div>
  );
}