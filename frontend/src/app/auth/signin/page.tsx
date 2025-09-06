"use client"

import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { EmailVerification } from "@/components/auth/EmailVerification"

type AuthView = 'login' | 'register' | 'verify-email'

export default function SignInPage() {
  const router = useRouter()
  const [view, setView] = useState<AuthView>('login')
  const [verificationEmail, setVerificationEmail] = useState<string>('')

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const handleLoginSuccess = () => {
    router.push("/dashboard")
  }

  const handleRegisterSuccess = (email: string) => {
    setVerificationEmail(email)
    setView('verify-email')
  }

  const handleVerificationSuccess = () => {
    setView('login')
  }

  const handleSwitchToLogin = () => {
    setView('login')
  }

  const handleSwitchToRegister = () => {
    setView('register')
  }

  const handleForgotPassword = (email?: string) => {
    // TODO: Implement forgot password flow
    console.log('Forgot password for:', email)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {view === 'login' && (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
          onForgotPassword={handleForgotPassword}
        />
      )}
      
      {view === 'register' && (
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      
      {view === 'verify-email' && (
        <EmailVerification
          email={verificationEmail}
          onSuccess={handleVerificationSuccess}
          onBack={() => setView('register')}
        />
      )}
    </div>
  )
}