"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import type { Player } from "@/lib/types"
import { PlayerAvatar, EmptyState, TrophyIcon, calculateAveragePI, calculateWinsLosses } from "@/components/shared"
import styles from "./leaderboard-content.module.scss"

type StatCategory = "points" | "rebounds" | "assists" | "steals" | "blocks" | "pi"

interface PlayerStat {
  player_id: string
  match_id: string
  team: 'team_a' | 'team_b'
  points: number
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
}

interface PlayerWithStats {
  id: string
  name: string
  nickname?: string | null
  avatar_url?: string | null
  position?: string | null
  jersey_number?: number | null
  stats: PlayerStat[]
}

interface LeaderboardPlayer {
  id: string
  name: string
  nickname?: string | null
  avatar_url?: string | null
  position?: string | null
  jersey_number?: number | null
}

interface PlayerLeaderboardData {
  id: string
  player: LeaderboardPlayer
  games: number
  wins: number
  losses: number
  avgPoints: number
  avgRebounds: number
  avgAssists: number
  avgSteals: number
  avgBlocks: number
  avgPI: number
  totalPoints: number
  totalRebounds: number
  totalAssists: number
  totalSteals: number
  totalBlocks: number
}

export function LeaderboardContent() {
  const [category, setCategory] = useState<StatCategory>("pi")
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

      // Cast stats to the correct type for PI calculation
      const allStats = stats as PlayerStat[]

      const playersMap: PlayerWithStats[] = players.map((player: { id: string; name: string; avatar_url: string | null }) => ({
        id: player.id,
        name: player.name,
        avatar_url: player.avatar_url,
        stats: allStats.filter((stat: PlayerStat) => stat.player_id === player.id)
      }));

      const playersArray: PlayerLeaderboardData[] = playersMap.map((player) => {
        const games = player.stats.length

        // Calculate wins and losses using utility function
        const { wins, losses } = calculateWinsLosses(player.id, allStats)

        const gamesWithPoints = player.stats.filter((stat: any) => stat.points != null).length
        const gamesWithRebounds = player.stats.filter((stat: any) => stat.rebounds != null).length
        const gamesWithAssists = player.stats.filter((stat: any) => stat.assists != null).length
        const gamesWithSteals = player.stats.filter((stat: any) => stat.steals != null).length
        const gamesWithBlocks = player.stats.filter((stat: any) => stat.blocks != null).length
        const totalPoints = player.stats.reduce((sum: number, stat: any) => sum + (stat.points || 0), 0)
        const totalRebounds = player.stats.reduce((sum: number, stat: any) => sum + (stat.rebounds || 0), 0)
        const totalAssists = player.stats.reduce((sum: number, stat: any) => sum + (stat.assists || 0), 0)
        const totalSteals = player.stats.reduce((sum: number, stat: any) => sum + (stat.steals || 0), 0)
        const totalBlocks = player.stats.reduce((sum: number, stat: any) => sum + (stat.blocks || 0), 0)

        // Calculate average PI using all stats for context
        const avgPI = calculateAveragePI(player.id, allStats)

        return {
          id: player.id,
          player: {
            id: player.id,
            name: player.name,
            nickname: player.nickname,
            avatar_url: player.avatar_url,
            position: player.position,
            jersey_number: player.jersey_number,
          },
          games,
          wins,
          losses,
          avgPoints: gamesWithPoints > 0 ? totalPoints / gamesWithPoints : 0,
          avgRebounds: gamesWithRebounds > 0 ? totalRebounds / gamesWithRebounds : 0,
          avgAssists: gamesWithAssists > 0 ? totalAssists / gamesWithAssists : 0,
          avgSteals: gamesWithSteals > 0 ? totalSteals / gamesWithSteals : 0,
          avgBlocks: gamesWithBlocks > 0 ? totalBlocks / gamesWithBlocks : 0,
          avgPI,
          totalPoints,
          totalRebounds,
          totalAssists,
          totalSteals,
          totalBlocks,
        }
      })  

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

  const getCategoryValue = (playerData: PlayerLeaderboardData) => {
    switch (category) {
      case "points":
        return playerData.avgPoints.toFixed(1)
      case "rebounds":
        return playerData.avgRebounds.toFixed(1)
      case "assists":
        return playerData.avgAssists.toFixed(1)
      case "steals":
        return playerData.avgSteals.toFixed(1)
      case "blocks":
        return playerData.avgBlocks.toFixed(1)
      case "pi":
        return playerData.avgPI.toFixed(1)
      default:
        return "0.0"
    }
  }

  const getCategoryLabel = () => {
    switch (category) {
      case "points":
        return "PPG"
      case "rebounds":
        return "RPG"
      case "assists":
        return "APG"
      case "steals":
        return "SPG"
      case "blocks":
        return "BPG"
      case "pi":
        return "PI"
      default:
        return ""
    }
  }

  const getRankClass = (index: number) => {
    if (index === 0) return styles.first
    if (index === 1) return styles.second
    if (index === 2) return styles.third
    return ""
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.subtitle}>See who&apos;s dominating the court</p>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${category === "pi" ? styles.active : ""}`}
          onClick={() => setCategory("pi")}
        >
          PI
        </button>
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
              <span className={styles.tableHeaderCell}>{getCategoryLabel()}</span>
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
                      name={playerData.player.nickname || playerData.player.name}
                      size="lg"
                    />
                    <div className={styles.playerInfo}>
                      <span className={styles.playerName}>
                        {playerData.player.nickname || playerData.player.name || "Unknown"}
                      </span>
                      <span className={styles.playerMeta}>
                        {playerData.player.position || "N/A"}
                        {playerData.player.jersey_number ? ` • #${playerData.player.jersey_number}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className={styles.statCell}>
                    <span className={`${styles.statValue} ${styles.highlight}`}>{playerData.wins}-{playerData.losses}</span>
                  </div>
                  <div className={styles.statCell}>
                    <span className={styles.statValue}>{playerData.games}</span>
                  </div>
                  <div className={styles.statCell}>
                    <span className={styles.statValue}>{getCategoryValue(playerData)}</span>
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
