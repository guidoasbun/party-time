"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"

export default function SignInButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          Signed in as {session.user?.name || session.user?.email}
        </span>
        <Button 
          onClick={() => signOut()}
          variant="outline"
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => signIn("cognito")}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Sign in with Cognito
      </Button>
    </div>
  )
}