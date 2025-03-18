'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Header from "@/components/shared/landing/header"
import { KeyRound, Eye, EyeOff, Check, X, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import Image from "next/image"

function ResetPasswordContent() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isReset, setIsReset] = useState(false)
  
  // Password strength checks
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [hasMinLength, setHasMinLength] = useState(false)
  const [hasUpperCase, setHasUpperCase] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)
  const [hasSymbol, setHasSymbol] = useState(false)

  // Check password strength as user types
  useEffect(() => {
    const minLength = password.length >= 6
    const upperCase = /[A-Z]/.test(password)
    const number = /[0-9]/.test(password)
    const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    setHasMinLength(minLength)
    setHasUpperCase(upperCase)
    setHasNumber(number)
    setHasSymbol(symbol)
    
    let strength = 0
    if (minLength) strength += 25
    if (upperCase) strength += 25
    if (number) strength += 25
    if (symbol) strength += 25
    
    setPasswordStrength(strength)
  }, [password])
  
  // Validate passwords match
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      })
      setIsLoading(false)
      return
    }
    
    if (passwordStrength < 75) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Please create a stronger password that meets all requirements",
      })
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
      setIsLoading(false)
      return
    }

    setIsReset(true)

    toast({
      title: "Success",
      description: "Your password has been updated.",
    })

    // Delay redirect to show success state
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="mx-4 w-full max-w-6xl overflow-hidden shadow-xl shadow-gray-400/50">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative hidden md:block">
              <Image
                src="/app-mockup.png" // Replace with your own image
                alt="Reset Password"
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Fallback if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = "/login-page.png";
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-6 left-6 z-10 max-w-[75%] text-white">
                <h2 className="text-xl font-bold mb-1">Reset Your Password</h2>
                <p className="text-sm">
                  Create a new password to secure your account
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-8 py-12 md:p-10 bg-card text-card-foreground">
              <CardHeader className="mb-4 pb-2 border-b border-border">
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    {isReset ? <ShieldCheck className="size-4" /> : <KeyRound className="size-4" />}
                  </div>
                  <h1 className="text-lg font-semibold mb-1">
                    {isReset ? "Password Updated" : "Reset Password"}
                  </h1>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 mt-4">
                {isReset ? (
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">Password Reset Successfully</h2>
                      <p className="text-sm text-muted-foreground">
                        Your password has been updated. You'll be redirected to the login page.
                      </p>
                    </div>
                    <div className="w-full pt-4">
                      <Link href="/auth/login" className="block w-full">
                        <Button className="w-full">
                          Go to Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Create a new password for your account. Choose a strong password that you don't use elsewhere.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pr-10"
                            placeholder="••••••••"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        
                        {/* Password strength meter */}
                        {password && (
                          <div className="mt-2 space-y-2">
                            <div className="space-y-1">
                              <Progress 
                                value={passwordStrength} 
                                className="h-1"
                                style={{
                                  backgroundColor: passwordStrength <= 25 ? "#f87171" : 
                                                  passwordStrength <= 50 ? "#fbbf24" : 
                                                  passwordStrength <= 75 ? "#a3e635" : "#4ade80"
                                }}
                              />
                              <p className="text-xs text-right text-muted-foreground">
                                {passwordStrength <= 25 && "Weak"}
                                {passwordStrength > 25 && passwordStrength <= 50 && "Fair"}
                                {passwordStrength > 50 && passwordStrength <= 75 && "Good"}
                                {passwordStrength > 75 && "Strong"}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                {hasMinLength ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                                <span>At least 6 characters</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {hasUpperCase ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                                <span>One uppercase letter</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {hasNumber ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                                <span>One number</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {hasSymbol ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                                <span>One special character</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`w-full pr-10 ${confirmPassword && !passwordsMatch ? "border-red-500 focus-visible:ring-red-300" : confirmPassword ? "border-green-500 focus-visible:ring-green-300" : ""}`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {confirmPassword && !passwordsMatch && (
                          <p className="text-xs text-red-500">Passwords don't match</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading || !passwordsMatch || passwordStrength < 75}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>Reset Password</>
                        )}
                      </Button>
                      
                      <Link href="/auth/login" className="block w-full">
                        <Button variant="link" className="w-full text-muted-foreground">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to login
                        </Button>
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Don't forget to add the Link import at the top
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}