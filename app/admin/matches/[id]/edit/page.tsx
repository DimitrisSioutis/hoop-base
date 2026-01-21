import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { EditMatchClient } from "./EditMatchClient"

interface EditMatchPageProps {
  params: Promise<{ id: string }>
}

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!appUser?.is_admin) {
    redirect("/matches")
  }

  // Fetch match with player stats
  const { data: match } = await supabase
    .from("matches")
    .select(`
      *,
      player_stats (
        *,
        players (*)
      )
    `)
    .eq("id", id)
    .single()

  if (!match) {
    notFound()
  }

  return <EditMatchClient match={match} />
}
