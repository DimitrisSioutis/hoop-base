"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import type { Player } from "@/lib/types"
import { PlayerAvatar, EmptyState, TrophyIcon, calculateAveragePI, calculateWinsLosses } from "@/components/shared"
import styles from "./leaderboard-content.module.scss"
import { mapPlayersStats, PlayerLeaderboardData, PlayerStat, PlayerWithStats } from "./utils"

type StatCategory = "points" | "rebounds" | "assists" | "steals" | "blocks" | "pi"


export function LeaderboardContent() {
  const [category, setCategory] = useState<StatCategory>("points")
  const [players, setPlayers] = useState<PlayerLeaderboardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowserClient()

      const { data: stats } = await supabase.from("player_stats").select(`
          player_id,
          match_id,
          team,
          points,
          rebounds,
          assists,
          steals,
          blocks,
          turnovers,
          players(*)
        `)

      if (!stats) {
        setLoading(false)
        return
      }


      const { data: players} = await supabase.from("players").select("id,name,avatar_url")

      const playersArray = mapPlayersStats(players, stats as PlayerStat[])

      setPlayers(playersArray)
      setLoading(false)
    }

    fetchData()
  }, [])

  const sortedPlayers = [...players].sort((a, b) => {
    switch (category) {
      case "points":
        return b.avgPoints - a.avgPoints
      case "rebounds":
        return b.avgRebounds - a.avgRebounds
      case "assists":
        return b.avgAssists - a.avgAssists
      case "steals":
        return b.avgSteals - a.avgSteals
      case "blocks":
        return b.avgBlocks - a.avgBlocks
      case "pi":
        return b.avgPI - a.avgPI
      default:
        return 0
    }
  })

  const getRankClass = (index: number) => {
    if (index === 0) return styles.first
    if (index === 1) return styles.second
    if (index === 2) return styles.third
    return ""
  }

  return (
    <>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${category === "points" ? styles.active : ""}`}
          onClick={() => setCategory("points")}
        >
          Points
        </button>
        <button
          className={`${styles.tab} ${category === "rebounds" ? styles.active : ""}`}
          onClick={() => setCategory("rebounds")}
        >
          Rebounds
        </button>
        <button
          className={`${styles.tab} ${category === "assists" ? styles.active : ""}`}
          onClick={() => setCategory("assists")}
        >
          Assists
        </button>
        <button
          className={`${styles.tab} ${category === "steals" ? styles.active : ""}`}
          onClick={() => setCategory("steals")}
        >
          Steals
        </button>
        <button
          className={`${styles.tab} ${category === "blocks" ? styles.active : ""}`}
          onClick={() => setCategory("blocks")}
        >
          Blocks
        </button>
      </div>

      <div className={styles.leaderboardCard}>
        {!loading && sortedPlayers.length > 0 ? (
          <>
            <div className={styles.tableHeader}>
              <span className={styles.tableHeaderCell}>#</span>
              <span className={styles.tableHeaderCell}>Player</span>
              <span className={styles.tableHeaderCell}>W-L</span>
              <span className={styles.tableHeaderCell}>GP</span>
              <span className={`${styles.tableHeaderCell} ${styles.hideMobile}`}>PPG</span>
              <span className={`${styles.tableHeaderCell} ${styles.hideMobile}`}>RPG</span>
              <span className={`${styles.tableHeaderCell} ${styles.hideMobile}`}>APG</span>
              <span className={`${styles.tableHeaderCell} ${styles.hideMobile}`}>SPG</span>
              <span className={`${styles.tableHeaderCell} ${styles.hideMobile}`}>BPG</span>
            </div>

            <div className={styles.leaderboardRows}>
              {sortedPlayers.map((playerData, index) => (
                <Link
                  key={playerData.id}
                  href={`/players/${playerData.id}`}
                  className={`${styles.leaderboardRow} ${getRankClass(index)}`}
                >
                  <div className={styles.rankCell}>
                    <span className={styles.rank}>{index + 1}</span>
                  </div>
                  <div className={styles.playerCell}>
                    <PlayerAvatar
                      avatarUrl={playerData.player.avatar_url}
                      name={playerData.player.name}
                      size="lg"
                    />
                    <div className={styles.playerInfo}>
                      <span className={styles.playerName}>
                        {playerData.player.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.statCell}>
                    <span className={`${styles.statValue} ${styles.highlight}`}>{playerData.wins}-{playerData.losses}</span>
                  </div>
                  <div className={styles.statCell}>
                    <span className={styles.statValue}>{playerData.games}</span>
                  </div>
                  <div className={`${styles.statCell} ${styles.hideMobile}`}>
                    <span className={styles.statValue}>{playerData.avgPoints.toFixed(1)}</span>
                  </div>
                  <div className={`${styles.statCell} ${styles.hideMobile}`}>
                    <span className={styles.statValue}>{playerData.avgRebounds.toFixed(1)}</span>
                  </div>
                  <div className={`${styles.statCell} ${styles.hideMobile}`}>
                    <span className={styles.statValue}>{playerData.avgAssists.toFixed(1)}</span>
                  </div>
                  <div className={`${styles.statCell} ${styles.hideMobile}`}>
                    <span className={styles.statValue}>{playerData.avgSteals.toFixed(1)}</span>
                  </div>
                  <div className={`${styles.statCell} ${styles.hideMobile}`}>
                    <span className={styles.statValue}>{playerData.avgBlocks.toFixed(1)}</span>
                  </div>


                  <div className={styles.mobileStats}>
                    <div className={styles.mobileStat}>
                      <span className={`${styles.mobileStatValue} ${styles.highlight}`}>{playerData.wins}-{playerData.losses}</span>
                      <span className={styles.mobileStatLabel}>W-L</span>
                    </div>
                    <div className={styles.mobileStat}>
                      <span className={styles.mobileStatValue}>{playerData.avgPoints.toFixed(1)}</span>
                      <span className={styles.mobileStatLabel}>PPG</span>
                    </div>
                    <div className={styles.mobileStat}>
                      <span className={styles.mobileStatValue}>{playerData.avgRebounds.toFixed(1)}</span>
                      <span className={styles.mobileStatLabel}>RPG</span>
                    </div>
                    <div className={styles.mobileStat}>
                      <span className={styles.mobileStatValue}>{playerData.avgAssists.toFixed(1)}</span>
                      <span className={styles.mobileStatLabel}>APG</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : loading ? (
          <EmptyState
            icon={<TrophyIcon />}
            message="Loading leaderboard..."
            large
          />
        ) : (
          <EmptyState
            icon={<TrophyIcon />}
            title="No Stats Yet"
            message="Play some games to see the leaderboard!"
            large
          />
        )}
      </div>
    </>
  )
}
