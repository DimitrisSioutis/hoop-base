import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { notFound } from "next/navigation"
import { getYouTubeEmbedUrl } from "@/lib/utils/youtube"
import { MatchDetailContent } from "@/components/matches"
import styles from "./match-detail.module.scss"

interface Props {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  // Fetch match
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single()

  if (!match) {
    notFound()
  }

  const embedUrl =match.youtube_url ? getYouTubeEmbedUrl(match.youtube_url) : null

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: appUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user?.id)
    .single()
  const isAdmin = appUser?.is_admin || false

  // Fetch player stats with players
  const { data } = await supabase
    .from("player_stats")
    .select(`
      *,
      player:players!player_stats_player_id_fkey (
        id,
        name,
        avatar_url
      )
    `)
    .eq("match_id", id)

  const playerStats = data ?? []

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <MatchDetailContent
          match={match}
          embedUrl={embedUrl}
          playerStats={playerStats}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  )
}
