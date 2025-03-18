'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Header from "@/components/shared/landing/header"
import { Mail, ArrowLeft, MailCheck, Loader2 } from 'lucide-react'
import Image from "next/image"

function ForgotPasswordContent() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    setEmail(email)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
      return
    }

    setIsSubmitted(true)
    
    toast({
      title: "Check your email",
      description: "We've sent you a password reset link. Kindly check your spam or junk folder if you don't see it in your inbox.",
    })
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="mx-4 w-full max-w-6xl overflow-hidden shadow-xl shadow-gray-400/50">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative hidden md:block">
              <Image
                src="/hero.png" // Replace with your own image
                alt="Forgot Password"
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
                <h2 className="text-xl font-bold mb-1">Password Recovery</h2>
                <p className="text-sm">
                  We'll send you a link to reset your password and get back to your account
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-8 py-12 md:p-10 bg-card text-card-foreground">
              <CardHeader className="mb-4 pb-2 border-b border-border">
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    {isSubmitted ? <MailCheck className="size-4" /> : <Mail className="size-4" />}
                  </div>
                  <h1 className="text-lg font-semibold mb-1">
                    {isSubmitted ? "Check Your Email" : "Forgot Password"}
                  </h1>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 mt-4">
                {isSubmitted ? (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MailCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">Recovery Link Sent</h2>
                      <p className="text-sm text-muted-foreground">
                        We've sent a password recovery link to<br />
                        <span className="font-medium">{email}</span>
                      </p>
                    </div>
                    <div className="pt-4 w-full space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setIsSubmitted(false)}
                      >
                        Back to reset form
                      </Button>
                      <Link href="/auth/login" className="block w-full">
                        <Button variant="link" className="w-full text-muted-foreground">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to login
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Enter your email address below and we'll send you instructions to reset your password.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="name@example.com"
                          required
                          className="w-full"
                          autoFocus
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>Send Reset Link</>
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}