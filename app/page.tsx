"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/auth/signup")
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"
          role="status"
          aria-label="Loading Growlytics"
        ></div>
        <p className="mt-4 text-muted-foreground" aria-live="polite">Loading Growlytics...</p>
      </div>
    </div>
  )
}
