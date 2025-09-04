"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"

interface UserInfo {
  user_id: string
  email: string
  name: string
  email_verified: boolean
  username: string
  groups: string[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.idToken) {
      // Fetch user info from backend using the ID token
      fetchUserInfo()
    }
  }, [status, session, router])

  const fetchUserInfo = async () => {
    try {
      if (!session?.idToken) return
      
      const response = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: {
          "Authorization": `Bearer ${session.idToken}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserInfo(data)
      } else {
        setError("Failed to fetch user information")
      }
    } catch (err) {
      setError("Error connecting to backend")
      console.error("Error fetching user info:", err)
    } finally {
      setLoading(false)
    }
  }

  const testProtectedRoute = async () => {
    try {
      if (!session?.accessToken) return
      
      const response = await fetch("http://localhost:8000/api/v1/auth/protected", {
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (response.ok) {
        alert(`Protected route success: ${data.message}`)
      } else {
        alert(`Protected route error: ${data.detail}`)
      }
    } catch (err) {
      alert("Error calling protected route")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Welcome to your Party-Time dashboard
                  </p>
                </div>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="outline"
                >
                  Sign Out
                </Button>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Authentication Status</h2>
                
                {error ? (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">Error: {error}</p>
                    <p className="text-xs text-red-600 mt-2">
                      Make sure your backend server is running on port 8000
                    </p>
                  </div>
                ) : userInfo ? (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">✅ Successfully authenticated!</p>
                    <div className="mt-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Name:</span> {userInfo.name}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Email:</span> {userInfo.email}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Email Verified:</span> {userInfo.email_verified ? "Yes" : "No"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">User ID:</span> {userInfo.user_id}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Groups:</span> {userInfo.groups.join(", ") || "None"}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6">
                  <Button
                    onClick={testProtectedRoute}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Test Protected Route
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}