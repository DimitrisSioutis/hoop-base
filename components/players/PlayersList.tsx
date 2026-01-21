import { EmptyState, UsersIcon } from "@/components/shared"
import { PlayerCard } from "./PlayerCard"
import styles from "./players-list.module.scss"

interface Player {
  id: string
  name: string
  nickname?: string | null
  avatar_url: string | null
  position?: string | null
  jersey_number?: number | null
}

interface PlayerStats {
  points: number[]
  rebounds: number[]
  assists: number[]
}

interface PlayersListProps {
  players: Player[] | null
  playerAverages: Map<string, PlayerStats>
}

export function PlayersList({ players, playerAverages }: PlayersListProps) {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Players</h1>
      </header>

      <div className={styles.playerGrid}>
        {players && players.length > 0 ? (
          players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              stats={playerAverages.get(player.id)}
            />
          ))
        ) : (
          <EmptyState
            icon={<UsersIcon />}
            title="No Players Yet"
            message="Players will appear here once an admin creates them"
            large
            gridSpan
          />
        )}
      </div>
    </>
  )
}
