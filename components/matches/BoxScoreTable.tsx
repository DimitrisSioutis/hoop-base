import Link from "next/link"
import { PlayerAvatar, calculateMatchPI, MatchPlayerStat } from "@/components/shared"
import styles from "./box-score-table.module.scss"

interface PlayerStat {
  id: string
  player_id: string
  team: 'team_a' | 'team_b'
  points: number
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  player: {
    id: string
    name: string
    avatar_url: string | null
  } | null
}

interface TeamTotals {
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
}

interface BoxScoreTableProps {
  title: string
  stats: PlayerStat[]
  totals: TeamTotals
  maxStats: {
    points: number
    rebounds: number
    assists: number
  }
  matchId: string
}

export function BoxScoreTable({ title, stats, totals, maxStats, matchId }: BoxScoreTableProps) {
  // Calculate PI for each player and sort by PI
  const statsWithPI = stats.map(stat => {
    const piStat: MatchPlayerStat = {
      player_id: stat.player_id,
      match_id: matchId,
      team: stat.team,
      points: stat.points,
      rebounds: stat.rebounds,
      assists: stat.assists,
      turnovers: stat.turnovers,
      steals: stat.steals,
      blocks: stat.blocks,
    }
    return {
      ...stat,
      pi: calculateMatchPI(piStat),
    }
  })

  const sortedStats = [...statsWithPI].sort((a, b) => b.pi - a.pi)
  const maxPI = Math.max(...sortedStats.map(s => s.pi), 0)

  return (
    <div className={styles.statsTable}>
      <h3 className={styles.teamTitle}>{title}</h3>

      <div className={styles.tableHeader}>
        <span className={styles.tableHeaderCell}>Player</span>
        <span className={styles.tableHeaderCell}>PI</span>
        <span className={styles.tableHeaderCell}>PTS</span>
        <span className={styles.tableHeaderCell}>REB</span>
        <span className={styles.tableHeaderCell}>AST</span>
        <span className={styles.tableHeaderCell}>STL</span>
        <span className={styles.tableHeaderCell}>BLK</span>
        <span className={styles.tableHeaderCell}>TO</span>
      </div>

      <div className={styles.statsRows}>
        {sortedStats.map((stat) => {
          const player = stat.player

          return (
            <Link
              key={stat.id}
              href={`/players/${stat.player_id}`}
              className={styles.statsRow}
            >
              <div className={styles.playerCell}>
                <PlayerAvatar
                  avatarUrl={player?.avatar_url}
                  name={player?.name}
                  size="md"
                />
                <span className={styles.playerName}>{player?.name}</span>
              </div>

              <span className={`${styles.statValue} ${stat.pi === maxPI && maxPI > 0 ? styles.highlight : ""}`}>
                {stat.pi.toFixed(1)}
              </span>
              <span className={`${styles.statValue} ${stat.points === maxStats.points && maxStats.points > 0 ? styles.highlight : ""}`}>
                {stat.points}
              </span>
              <span className={`${styles.statValue} ${stat.rebounds === maxStats.rebounds && maxStats.rebounds > 0 ? styles.highlight : ""}`}>
                {stat.rebounds}
              </span>
              <span className={`${styles.statValue} ${stat.assists === maxStats.assists && maxStats.assists > 0 ? styles.highlight : ""}`}>
                {stat.assists}
              </span>
              <span className={styles.statValue}>{stat.steals}</span>
              <span className={styles.statValue}>{stat.blocks}</span>
              <span className={styles.statValue}>{stat.turnovers}</span>
            </Link>
          )
        })}
      </div>

      <div className={styles.teamTotals}>
        <span>Totals</span>
        <span>-</span>
        <span>{totals.points}</span>
        <span>{totals.rebounds}</span>
        <span>{totals.assists}</span>
        <span>{totals.steals}</span>
        <span>{totals.blocks}</span>
        <span>{totals.turnovers}</span>
      </div>
    </div>
  )
}
