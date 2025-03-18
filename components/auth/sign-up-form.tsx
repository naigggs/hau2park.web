"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef, Suspense } from "react";
import { registerUser } from "@/app/api/auth/actions";
import { Progress } from "@/components/ui/progress";
import { Check, X, Upload, Eye, EyeOff, AlertCircle, Loader2, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/shared/loading/spinner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  
  // Multi-step form control
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
  
  // File handling states
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [fileUploadUrl, setFileUploadUrl] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
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

  const { toast } = useToast();

  // Reset error state when changing steps
  useEffect(() => {
    setFormError(null);
  }, [step]);

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

  // Validate file type
  const validateFileType = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      setFileError(`File must be PNG, JPG, or PDF. Selected file type: ${file.type}`);
      return false;
    }
    
    return true;
  };

  // Validate file size
  const validateFileSize = (file: File) => {
    // 10MB in bytes
    const maxSize = 10 * 1024 * 1024;
    
    if (file.size > maxSize) {
      setFileError(`File size must be less than 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    
    setFileError(null);
    return true;
  };

  // Generate file preview
  const generateFilePreview = (file: File) => {
    if (file.type === 'application/pdf') {
      // For PDFs, just show icon
      setFilePreview(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFilePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload file immediately upon selection
  const uploadFile = async (file: File) => {
    if (!email) {
      setFileError("Please fill out your email first before uploading a document");
      return false;
    }
    
    setFileUploading(true);
    setFileUploadProgress(0);
    
    try {
      const fileExt = file.name.split('.').pop() || '';
      const fileName = `${email.replace('@', '_at_')}-id.${fileExt}`;
      
      // Use mock upload progress simulation
      const uploadProgressInterval = setInterval(() => {
        setFileUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 200);
      
      // Actually upload the file
      const { error: uploadError } = await supabase.storage
        .from('hau2park')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(uploadProgressInterval);
      
      if (uploadError) {
        console.error("Error uploading document:", uploadError);
        setFileError(`Upload failed: ${uploadError.message}`);
        setFileUploading(false);
        setFileUploadProgress(0);
        return false;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hau2park')
        .getPublicUrl(fileName);
      
      setFileUploadUrl(publicUrl);
      setFileUploadProgress(100);
      setFileUploadSuccess(true);
      
      setTimeout(() => {
        setFileUploading(false);
      }, 1000);
      
      toast({
        title: "Document uploaded",
        description: "Your document was successfully uploaded",
      });
      
      return true;
    } catch (error) {
      console.error("File upload error:", error);
      setFileError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFileUploading(false);
      setFileUploadProgress(0);
      return false;
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setFileUploadSuccess(false);
    setFileUploadUrl(null);
    setFilePreview(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!validateFileType(file)) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      // Validate file size
      if (!validateFileSize(file)) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      setFileName(file.name);
      setSelectedFile(file);
      generateFilePreview(file);
      
      // Upload file immediately
      await uploadFile(file);
    } else {
      setFileName("");
      setSelectedFile(null);
    }
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
    
    // Clear previous errors
    setFormError(null);
    
    // Final validation before submission
    const isPhoneValid = validatePhone(phone);
    
    // Check if file was uploaded successfully
    if (!fileUploadSuccess || !fileUploadUrl) {
      setFileError("Please upload an ID document");
      return;
    }
    
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
    formData.append('vehicle_plate_number', `${vehicleLetters} ${vehicleNumbers}`);
    formData.append('phone', `+63${phone}`);
    
    // Add the pre-uploaded document URL
    formData.append('documentUrl', fileUploadUrl);
    
    // We don't need to include the actual file since it's already uploaded
    // but including as backup if server needs to handle legacy code paths
    // if (selectedFile) {
    //   formData.append('document1', selectedFile);
    // }
  
    try {
      const result = await registerUser(formData);
      
      // Use localStorage instead of sessionStorage
      localStorage.setItem('registrationSuccess', 'true');
      
      setLoading(false);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created and is pending approval.",
      });
      
      // Use a separate direct navigation with setTimeout to ensure storage is set
      setTimeout(() => {
        window.location.href = '/auth/login?registered=true';
      }, 1000);
      
    } catch (error) {
      console.error("Error registering user:", error);
      
      setLoading(false);
      setFormError(error instanceof Error ? error.message : "There was an error creating your account. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was an error creating your account.",
      });
    }
  };

  // Custom file upload button click handler
  const handleUploadClick = () => {
    if (fileUploading) return; // Don't allow clicking when uploading
    fileInputRef.current?.click();
  };

  return (
    <form
      className={cn("flex flex-col gap-8", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Fill in your details below to create your account
        </p>
      </div>

      {/* Form Error Alert */}
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

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
                    value={phone || ""}
                    onChange={(e) => formatPhoneNumber(e.target.value)}
                    maxLength={10}
                  />
                </div>
                {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
                <p className="text-xs text-muted-foreground">Enter 10 digits, starting with 9 (e.g., 9123456789)</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="document1">Upload ID <span className="text-xs text-muted-foreground">(Max: 10MB)</span></Label>
              <div 
                className={cn(
                  "relative border-2 border-dashed rounded-md border-gray-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors",
                  fileError ? "border-red-500" : fileUploadSuccess ? "border-green-500" : "",
                  fileUploading ? "cursor-not-allowed" : "cursor-pointer"
                )}
                onClick={handleUploadClick}
              >
                {/* Hidden file input */}
                <input 
                  ref={fileInputRef}
                  id="document1" 
                  name="document1" 
                  type="file" 
                  className="hidden"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={handleFileChange}
                  disabled={fileUploading}
                />
                
                <div className="flex flex-col items-center gap-3 w-full">
                  {fileUploading ? (
                    <>
                      <div className="w-full max-w-[200px] mb-2">
                        <Progress value={fileUploadProgress} className="h-2" />
                        <p className="text-xs text-center mt-1">
                          {Math.round(fileUploadProgress)}% uploaded
                        </p>
                      </div>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </>
                  ) : fileUploadSuccess ? (
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      {filePreview ? (
                        <div className="w-full max-w-[200px] h-[100px] rounded-md overflow-hidden border mb-2">
                          <img
                            src={filePreview}
                            alt="ID preview" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-[200px] h-[100px] rounded-md overflow-hidden border bg-muted/20 flex items-center justify-center mb-2">
                          <FileImage className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium">Document uploaded!</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">
                        {fileName}
                      </p>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadClick();
                        }}
                      >
                        Replace file
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className={cn("h-8 w-8", fileError ? "text-red-500" : "text-muted-foreground")} />
                      {fileName ? (
                        <p className="text-sm truncate max-w-full">{fileName}</p>
                      ) : (
                        <>
                          <p className="font-medium">Click to upload</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG or PDF (max. 10MB)</p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              {fileError && <p className="text-xs text-red-500">{fileError}</p>}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={loading || fileUploading}
            >
              Back
            </Button>
          )}
          <Button 
            type="submit" 
            className={step === 1 ? "w-full" : "ml-auto"} 
            disabled={loading || fileUploading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                {step === totalSteps ? "Registering..." : "Processing..."}
              </span>
            ) : fileUploading && step === totalSteps ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" className="text-white" />
                Uploading document...
              </span>
            ) : (
              step === totalSteps ? "Register" : "Next"
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