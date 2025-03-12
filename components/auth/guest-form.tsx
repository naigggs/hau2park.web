"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { GuestSignUp } from "@/app/api/auth/actions";
import { Spinner } from "@/components/shared/loading/spinner";
import { Progress } from "@/components/ui/progress";

export function GuestForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  // Set totalSteps to 3 for the three-part process.
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Store form field values so data persists between steps.
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    vehiclePlateNumber: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If not on the final step, proceed to the next step.
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    // On the final step, gather data and submit.
    setLoading(true);
    const data = new FormData();
    Object.entries(formValues).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      await GuestSignUp(data);
    } catch (error) {
      console.error("Error registering user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-8", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Guest Account Creation Request</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Fill in your details below to create your guest request
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="w-full">
        <Progress value={(step / totalSteps) * 100} className="mb-4" />
        <p className="text-center text-sm text-muted-foreground">
          Step {step} of {totalSteps}
        </p>
      </div>

      <div className="grid gap-8">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  required
                  value={formValues.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={formValues.lastName}
                  onChange={handleChange}
                />
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
                value={formValues.email}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="******"
                required
                value={formValues.password}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="******"
                required
                value={formValues.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
              <Input
                id="vehiclePlateNumber"
                name="vehiclePlateNumber"
                placeholder="CBT 901"
                required
                value={formValues.vehiclePlateNumber}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone No.</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="09123456789"
                required
                value={formValues.phone}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Back
            </Button>
          )}
          <Button type="submit" className="ml-auto" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                {step === totalSteps ? "Submitting..." : "Processing..."}
              </span>
            ) : (
              step === totalSteps ? "Submit Request" : "Next"
            )}
          </Button>
        </div>
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
