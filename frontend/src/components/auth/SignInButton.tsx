"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"

export default function SignInButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-foreground hover:text-primary transition-colors">
          {session.user?.name || session.user?.email}
        </Link>
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
    <Link href="/auth/signin">
      <Button>
        Get Started
      </Button>
    </Link>
  )
}