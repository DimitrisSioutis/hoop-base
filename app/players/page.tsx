import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { PlayersList } from "@/components/players"
import styles from "./players.module.scss"

export default async function PlayersPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch all players
  const { data: players } = await supabase.from("players").select("*").order("name", { ascending: true })

  // Fetch all stats to calculate averages
  const { data: allStats } = await supabase.from("player_stats").select("*")

  // Calculate averages per player
  const playerAverages = new Map<string, { points: number[]; rebounds: number[]; assists: number[] }>()

  allStats?.forEach((stat) => {
    if (!playerAverages.has(stat.player_id)) {
      playerAverages.set(stat.player_id, { points: [], rebounds: [], assists: [] })
    }
    const playerData = playerAverages.get(stat.player_id)!
    playerData.points.push(stat.points)
    if (stat.rebounds !== null) playerData.rebounds.push(stat.rebounds)
    if (stat.assists !== null) playerData.assists.push(stat.assists)
  })

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <PlayersList players={players} playerAverages={playerAverages} />
      </main>
    </div>
  )
}
