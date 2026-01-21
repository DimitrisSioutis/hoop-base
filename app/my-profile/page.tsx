import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { redirect } from "next/navigation"
import { MyProfileContent } from "@/components/my-profile"
import styles from "./my-profile.module.scss"

export default async function MyProfilePage() {
  const supabase = await getSupabaseServerClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch app user
  const { data: appUser } = await supabase.from("users").select("*").eq("id", user.id).single()

  // If user doesn't have a linked player, redirect to matches
  if (!appUser?.player_id) {
    redirect("/matches")
  }

  // Fetch player info
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", appUser.player_id)
    .single()

  // Fetch player's game stats with match info
  const { data: gameStats } = await supabase
    .from("player_stats")
    .select(`*, matches(id, match_date, location)`)
    .eq("player_id", appUser.player_id)
    .order("created_at", { ascending: false })

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <MyProfileContent
          player={player}
          gameStats={gameStats}
        />
      </main>
    </div>
  )
}
