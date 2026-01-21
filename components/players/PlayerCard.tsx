import Link from "next/link";
import { PlayerAvatar, getAvg } from "@/components/shared";
import styles from "./player-card.module.scss";

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    nickname?: string | null;
    avatar_url: string | null;
    position?: string | null;
    jersey_number?: number | null;
  };
  stats?: {
    points: number[];
    rebounds: number[];
    assists: number[];
  };
}

export function PlayerCard({ player, stats }: PlayerCardProps) {
  return (
    <Link href={`/players/${player.id}`} className={styles.playerCard}>
      <PlayerAvatar
        avatarUrl={player.avatar_url}
        name={player.nickname || player.name}
        size="xxl"
      />
      <h2 className={styles.playerName}>
        {player.nickname || player.name || "Unknown"}
      </h2>
      <div className={styles.playerStats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {getAvg(stats?.points || [])}
          </span>
          <span className={styles.statLabel}>PPG</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {getAvg(stats?.rebounds || [])}
          </span>
          <span className={styles.statLabel}>RPG</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {getAvg(stats?.assists || [])}
          </span>
          <span className={styles.statLabel}>APG</span>
        </div>
      </div>
    </Link>
  );
}
