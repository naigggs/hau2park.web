'use client'

import React from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      })
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
      return
    }

    toast({
      title: "Success",
      description: "Your password has been updated.",
    })

    router.push('/auth/login')
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              type="password"
              name="password"
              placeholder="New password"
              required
              className="w-full"
              minLength={6}
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
              className="w-full"
              minLength={6}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}