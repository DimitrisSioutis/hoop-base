import Link from "next/link"
import { PlayerAvatar, EmptyState, VideoIcon, ChevronLeftIcon, formatDate } from "@/components/shared"
import styles from "./player-detail-content.module.scss"

interface GameStat {
  id: string
  points: number
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  matches?: {
    id: string
    match_date: string
    location: string | null
  } | null
}

interface Player {
  id: string
  name: string
  nickname?: string | null
  avatar_url: string | null
  position?: string | null
  jersey_number?: number | null
}

interface Averages {
  points: string
  rebounds: string
  assists: string
  steals: string
  blocks: string
  turnovers: string
  pi: string
}

interface PlayerDetailContentProps {
  player: Player
  gameStats: GameStat[] | null
  averages: Averages
  gamesPlayed: number
}

export function PlayerDetailContent({ player, gameStats, averages, gamesPlayed }: PlayerDetailContentProps) {
  return (
    <>
      <Link href="/players" className={styles.backLink}>
        <ChevronLeftIcon />
        Back to Players
      </Link>

      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <PlayerAvatar
            avatarUrl={player.avatar_url}
            name={player.nickname || player.name}
            size="xxxl"
          />
        </div>
        <div className={styles.infoSection}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{player.nickname || player.name || "Unknown"}</h1>
            {player.jersey_number && <span className={styles.jerseyNumber}>#{player.jersey_number}</span>}
          </div>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Position</span>
              <span className={styles.metaValue}>{player.position || "N/A"}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Games Played</span>
              <span className={styles.metaValue}>{gamesPlayed}</span>
            </div>
            {player.name && player.nickname && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Full Name</span>
                <span className={styles.metaValue}>{player.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{averages.pi}</span>
          <span className={styles.statLabel}>PI</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{averages.points}</span>
          <span className={styles.statLabel}>PPG</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{averages.rebounds}</span>
          <span className={styles.statLabel}>RPG</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{averages.assists}</span>
          <span className={styles.statLabel}>APG</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{averages.steals}</span>
          <span className={styles.statLabel}>SPG</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{averages.blocks}</span>
          <span className={styles.statLabel}>BPG</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{averages.turnovers}</span>
          <span className={styles.statLabel}>TPG</span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Game Log</h2>
        </div>

        {gameStats && gameStats.length > 0 ? (
          <>
            <div className={styles.tableHeader}>
              <span className={styles.tableHeaderCell}>Game</span>
              <span className={styles.tableHeaderCell}>PTS</span>
              <span className={styles.tableHeaderCell}>REB</span>
              <span className={styles.tableHeaderCell}>AST</span>
              <span className={styles.tableHeaderCell}>STL</span>
              <span className={styles.tableHeaderCell}>BLK</span>
              <span className={styles.tableHeaderCell}>TO</span>
            </div>
            <div className={styles.gameLog}>
              {gameStats.map((stat) => (
                <Link key={stat.id} href={`/matches/${stat.matches?.id}`} className={styles.gameRow}>
                  <div className={styles.gameInfo}>
                    <span className={styles.gameTitle}>
                      {stat.matches?.match_date ? formatDate(stat.matches.match_date) : "Unknown Match"}
                    </span>
                    <span className={styles.gameDate}>
                      {stat.matches?.location || ""}
                    </span>
                  </div>
                  <div className={styles.gameStat} data-label="PTS">
                    <span className={styles.gameStatValue}>{stat.points}</span>
                  </div>
                  <div className={styles.gameStat} data-label="REB">
                    <span className={styles.gameStatValue}>{stat.rebounds ?? "-"}</span>
                  </div>
                  <div className={styles.gameStat} data-label="AST">
                    <span className={styles.gameStatValue}>{stat.assists ?? "-"}</span>
                  </div>
                  <div className={styles.gameStat} data-label="STL">
                    <span className={styles.gameStatValue}>{stat.steals ?? "-"}</span>
                  </div>
                  <div className={styles.gameStat} data-label="BLK">
                    <span className={styles.gameStatValue}>{stat.blocks ?? "-"}</span>
                  </div>
                  <div className={styles.gameStat} data-label="TO">
                    <span className={styles.gameStatValue}>{stat.turnovers ?? "-"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<VideoIcon />}
            message="No games recorded yet for this player"
          />
        )}
      </section>
    </>
  )
}
