"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, Suspense } from "react";
import { GuestSignUp } from "@/app/api/auth/actions";
import { Spinner } from "@/components/shared/loading/spinner";
import { Progress } from "@/components/ui/progress";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GuestForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { toast } = useToast();
  
  // Set totalSteps to 3 for the three-part process.
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [vehicleLetters, setVehicleLetters] = useState("");
  const [vehicleNumbers, setVehicleNumbers] = useState("");
  const [phone, setPhone] = useState("");
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation states
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // Password strength tracking
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);

  // Check password strength
  useEffect(() => {
    const minLength = password.length >= 6;
    const upperCase = /[A-Z]/.test(password);
    const number = /[0-9]/.test(password);
    const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
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
  }, [password]);

  // Validate name (letters and spaces allowed)
  const validateName = (name: string, field: 'first' | 'last') => {
    const letterAndSpaceRegex = /^[A-Za-z\s]+$/;
    
    if (!name) {
      field === 'first' 
        ? setFirstNameError("First name is required") 
        : setLastNameError("Last name is required");
      return false;
    }
    
    if (!letterAndSpaceRegex.test(name)) {
      field === 'first' 
        ? setFirstNameError("First name must contain only letters and spaces") 
        : setLastNameError("Last name must contain only letters and spaces");
      return false;
    }
    
    field === 'first' ? setFirstNameError(null) : setLastNameError(null);
    return true;
  };

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address (e.g., name@example.com)");
      return false;
    }
    
    setEmailError(null);
    return true;
  };

  // Validate password
  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    
    if (!(hasUpperCase && hasNumber && hasSymbol)) {
      setPasswordError("Password must include at least one uppercase letter, one number, and one symbol");
      return false;
    }
    
    setPasswordError(null);
    return true;
  };

  // Validate confirm password
  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    
    setConfirmPasswordError(null);
    return true;
  };

  // Validate phone (Philippines format)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    
    if (!phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return false;
    }
    
    setPhoneError(null);
    return true;
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove any non-digits
    const digits = value.replace(/\D/g, '');
    
    // Only keep the last 10 digits if more are entered
    const limitedDigits = digits.slice(-10);
    
    setPhone(limitedDigits);
  };

  // Validate current step and move to next
  const goToNextStep = () => {
    if (step === 1) {
      const isFirstNameValid = validateName(firstName, 'first');
      const isLastNameValid = validateName(lastName, 'last');
      const isEmailValid = validateEmail(email);
      
      if (isFirstNameValid && isLastNameValid && isEmailValid) {
        setStep(step + 1);
      }
    } else if (step === 2) {
      const isPasswordValid = validatePassword();
      const isConfirmPasswordValid = validateConfirmPassword();
      
      if (isPasswordValid && isConfirmPasswordValid) {
        setStep(step + 1);
      }
    }
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (step !== totalSteps) {
      goToNextStep();
      return;
    }
    
    // Final validation before submission
    const isPhoneValid = validatePhone(phone);
    
    if (!isPhoneValid) {
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    
    // Add all form fields manually to ensure they're included
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('vehiclePlateNumber', `${vehicleLetters} ${vehicleNumbers}`);
    formData.append('phone', `+63${phone}`);
  
    try {
      // Set flag for successful registration before the redirect happens
      localStorage.setItem('guestJustRegistered', 'true');
      await GuestSignUp(formData);
      
      // This part might not execute if the redirect happens immediately
    } catch (error) {
      console.error("Error registering guest:", error);
      
      // Remove the flag if registration fails
      localStorage.removeItem('guestJustRegistered');
      
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was an error creating your guest account.",
      });
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
        <Suspense fallback={<div className="h-4 w-full bg-muted mb-4 rounded-full animate-pulse"></div>}>
          <Progress value={(step / totalSteps) * 100} className="mb-4" />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          Step {step} of {totalSteps}
        </p>
      </div>

      <div className="grid gap-8">
        {step === 1 && (
          <>
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    type="text" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => validateName(firstName, 'first')}
                    className={firstNameError ? "border-red-500" : ""}
                    placeholder="John"
                  />
                  {firstNameError && <p className="text-xs text-red-500">{firstNameError}</p>}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    type="text" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => validateName(lastName, 'last')}
                    className={lastNameError ? "border-red-500" : ""}
                    placeholder="Doe"
                  />
                  {lastNameError && <p className="text-xs text-red-500">{lastNameError}</p>}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="johndoe@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => validateEmail(email)}
                    className={emailError ? "border-red-500" : ""}
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    className={passwordError ? "border-red-500 pr-10" : "pr-10"}
                    placeholder="Create a strong password"
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
                <div className="mt-2">
                  <Suspense fallback={<div className="h-1 w-full bg-muted rounded-full animate-pulse"></div>}>
                    <Progress 
                      value={passwordStrength} 
                      className="h-1" 
                      color={
                        passwordStrength <= 25 ? "bg-red-500" : 
                        passwordStrength <= 50 ? "bg-orange-500" : 
                        passwordStrength <= 75 ? "bg-yellow-500" : "bg-green-500"
                      }
                    />
                  </Suspense>
                  <div className="mt-2 space-y-1 text-xs">
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
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              </div>
              
              <div className="grid gap-2 pt-4">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={validateConfirmPassword}
                    className={confirmPasswordError ? "border-red-500 pr-10" : "pr-10"}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && <p className="text-xs text-red-500">{confirmPasswordError}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-8">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label>Vehicle Plate Number</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    id="vehicleLetters" 
                    name="vehicleLetters" 
                    type="text" 
                    placeholder="ABC" 
                    required 
                    value={vehicleLetters}
                    onChange={(e) => setVehicleLetters(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                    className="uppercase"
                    maxLength={3}
                  />
                  <Input 
                    id="vehicleNumbers" 
                    name="vehicleNumbers" 
                    type="text" 
                    placeholder="1234" 
                    required 
                    value={vehicleNumbers}
                    onChange={(e) => setVehicleNumbers(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-gray-100 border-r border-gray-300 rounded-l-md text-gray-700">
                    +63
                  </div>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    required
                    placeholder="9123456789"
                    className="pl-14"
                    value={phone}
                    onChange={(e) => formatPhoneNumber(e.target.value)}
                    maxLength={10}
                  />
                </div>
                {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
                <p className="text-xs text-muted-foreground">Enter 10 digits, starting with 9 (e.g., 9123456789)</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={loading}
            >
              Back
            </Button>
          )}
          <Button 
            type="submit" 
            className={step === 1 ? "w-full" : "ml-auto"} 
            disabled={loading}
          >
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