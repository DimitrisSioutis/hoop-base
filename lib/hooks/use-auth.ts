"use client"

import { useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as AppUser } from "@/lib/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAppUser = useCallback(async (userId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.from("users").select("*").eq("id", userId).single()

    setAppUser(data)
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchAppUser(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchAppUser(session.user.id)
      } else {
        setAppUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchAppUser])

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return {
    user,
    appUser,
    loading,
    isAdmin: appUser?.is_admin ?? false,
    signOut,
    refreshAppUser: () => user && fetchAppUser(user.id),
  }
}
