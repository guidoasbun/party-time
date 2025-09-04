"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("cognito", { 
        callbackUrl: "/dashboard",
        redirect: true
      })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Party-Time
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Plan your perfect events with ease
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Signing in..." : "Sign in with AWS Cognito"}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                This will redirect you to AWS Cognito where you can:
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Sign in with email/password</li>
                <li>• Sign in with Google</li>
                <li>• Create a new account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}