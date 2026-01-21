import Link from "next/link"
import type { Player } from "@/lib/types"
import styles from "./my-profile-content.module.scss"

interface GameStat {
  id: string
  match_id: string
  player_id: string
  team: "team_a" | "team_b"
  points: number
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  matches: {
    id: string
    match_date: string
    location: string | null
  } | null
}

interface MyProfileContentProps {
  player: Player | null
  gameStats: GameStat[] | null
}

export function MyProfileContent({ player, gameStats }: MyProfileContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        {player && (
          <p className={styles.subtitle}>
            Welcome, <span>{player.nickname || player.name}</span>
          </p>
        )}
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Matches</h2>
          <span className={styles.matchCount}>{gameStats?.length || 0} games played</span>
        </div>

        {gameStats && gameStats.length > 0 ? (
          <div className={styles.matchList}>
            {gameStats.map((stat) => (
              <Link
                key={stat.id}
                href={`/matches/${stat.match_id}`}
                className={styles.matchItem}
              >
                <div className={styles.matchInfo}>
                  <span className={styles.matchDate}>
                    {stat.matches ? formatDate(stat.matches.match_date) : "Unknown date"}
                  </span>
                  <span className={styles.matchLocation}>
                    {stat.matches?.location || "Unknown location"}
                  </span>
                </div>
                <div className={styles.matchStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{stat.points}</span>
                    <span className={styles.statLabel}>PTS</span>
                  </div>
                  {stat.rebounds !== null && (
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{stat.rebounds}</span>
                      <span className={styles.statLabel}>REB</span>
                    </div>
                  )}
                  {stat.assists !== null && (
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{stat.assists}</span>
                      <span className={styles.statLabel}>AST</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
            <p>No matches played yet</p>
          </div>
        )}
      </section>
    </>
  )
}
