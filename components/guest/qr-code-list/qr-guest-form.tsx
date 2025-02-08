'use client'

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
// import { registerUser } from "@/app/api/auth/actions";

export function GuestForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
    //   await registerUser(formData);
    } catch (error) {
      console.error("Error registering user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Submit a Guest Request</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Fill in your details below to create your guest request
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" type="text" placeholder="John" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" type="text" placeholder="Doe" required />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="******" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="******"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
          <Input id="purposeOfVisit" name="purposeOfVisit" type="text" placeholder="Seminar Speaking" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="appointmentDate">Appointment Date</Label>
            <Input id="appointmentDate" name="appointmentDate" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
            <Input id="vehiclePlateNumber" name="vehiclePlateNumber" placeholder="CBT 901" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="timeIn">Time-In</Label>
            <Input id="timeIn" name="timeIn" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timeOut">Time-Out</Label>
            <Input id="timeOut" name="timeOut" required />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  );
}
