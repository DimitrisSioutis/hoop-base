import Link from "next/link"
import { CalendarIcon, LocationIcon, UsersIcon, formatDateLong } from "@/components/shared"
import { BoxScoreTable } from "./BoxScoreTable"
import styles from "./match-detail-content.module.scss"

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

interface MatchPlayerStat {
  player_id: string
  match_id: string
  team: 'team_a' | 'team_b'
  points: number
  rebounds: number | null
  assists: number | null
  turnovers: number | null
}

interface Match {
  id: string
  title?: string
  description?: string | null
  youtube_url: string | null
  match_date: string
  location: string | null
}

interface MatchDetailContentProps {
  match: Match
  embedUrl: string | null
  playerStats: PlayerStat[]
  isAdmin?: boolean
}

export function MatchDetailContent({ match, embedUrl, playerStats, isAdmin = false }: MatchDetailContentProps) {
  // Split teams
  const teamAStats = playerStats.filter(s => s.team === "team_a")
  const teamBStats = playerStats.filter(s => s.team === "team_b")

  // Create allMatchStats for PI calculation
  const allMatchStats: MatchPlayerStat[] = playerStats.map(s => ({
    player_id: s.player_id,
    match_id: match.id,
    team: s.team,
    points: s.points,
    rebounds: s.rebounds,
    assists: s.assists,
    turnovers: s.turnovers,
  }))

  // Calculate totals
  const calculateTotals = (stats: PlayerStat[]) =>
    stats.reduce(
      (acc, s) => {
        acc.points += s.points ?? 0
        acc.rebounds += s.rebounds ?? 0
        acc.assists += s.assists ?? 0
        acc.steals += s.steals ?? 0
        acc.blocks += s.blocks ?? 0
        acc.turnovers += s.turnovers ?? 0
        return acc
      },
      { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0 }
    )

  const teamATotals = calculateTotals(teamAStats)
  const teamBTotals = calculateTotals(teamBStats)

  // Get max stats for highlighting
  const getMax = (stats: PlayerStat[], key: 'points' | 'rebounds' | 'assists') =>
    Math.max(...stats.map(s => s[key] ?? 0), 0)

  const maxA = {
    points: getMax(teamAStats, "points"),
    rebounds: getMax(teamAStats, "rebounds"),
    assists: getMax(teamAStats, "assists"),
  }

  const maxB = {
    points: getMax(teamBStats, "points"),
    rebounds: getMax(teamBStats, "rebounds"),
    assists: getMax(teamBStats, "assists"),
  }

  return (
    <>
      <div className={styles.topBar}>
        <Link href="/matches" className={styles.backLink}>
          ← Back
        </Link>
        {isAdmin && (
          <Link href={`/admin/matches/${match.id}/edit`} className={styles.editButton}>
            Edit Match
          </Link>
        )}
      </div>

      <div className={styles.videoSection}>
        {embedUrl && (
          <div className={styles.videoWrapper}>
            <iframe
              src={embedUrl}
              title={match.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        <div className={styles.matchHeader}>
          <h1 className={styles.matchTitle}>{match.title}</h1>
          <div className={styles.matchMeta}>
            <span className={styles.metaItem}>
              <CalendarIcon />
              {formatDateLong(match.match_date)}
            </span>
            {match.location && (
              <span className={styles.metaItem}>
                <LocationIcon />
                {match.location}
              </span>
            )}
            <span className={styles.metaItem}>
              <UsersIcon />
              {playerStats.length} Players
            </span>
          </div>
          {match.description && <p className={styles.description}>{match.description}</p>}
        </div>
      </div>

      <section className={styles.section}>
        <h2>Box Score</h2>

        {playerStats.length ? (
          <>
            <BoxScoreTable
              title="Team A"
              stats={teamAStats}
              totals={teamATotals}
              maxStats={maxA}
              matchId={match.id}
              allMatchStats={allMatchStats}
            />
            <BoxScoreTable
              title="Team B"
              stats={teamBStats}
              totals={teamBTotals}
              maxStats={maxB}
              matchId={match.id}
              allMatchStats={allMatchStats}
            />
          </>
        ) : (
          <p className={styles.noStats}>No stats yet</p>
        )}
      </section>
    </>
  )
}
