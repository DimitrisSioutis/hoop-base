import Link from "next/link";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import {
  PlayerAvatar,
  CalendarIcon,
  LocationIcon,
  PlayIcon,
  formatDate,
} from "@/components/shared";
import styles from "./match-card.module.scss";

interface PlayerStats {
  team: string;
  players?: {
    name: string;
    avatar_url?: string | null;
  } | null;
}

interface MatchCardProplayer {
  match: {
    id: string;
    youtube_url: string | null;
    match_date: string;
    location: string | null;
    teams?: any;
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function TeamDisplay({ players }: { players: any[] }) {
  return (
    <span className={styles.teamDisplay}>
      {players.map((player, index) => {
        if (!player) return null;
        return (
          <span
            key={`${player.team}-${player.name}`}
            className={styles.playerInTitle}
          >
            {player.avatar_url ? (
              <PlayerAvatar
                avatarUrl={player.avatar_url}
                name={player.name}
                size="xs"
              />
            ) : (
              <span className={styles.initials}>
                {getInitials(player.name)}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function MatchCard({ match }: MatchCardProplayer) {
  return (
    <Link href={`/matches/${match.id}`} className={styles.matchCard}>
      <div className={styles.thumbnail}>
        <img
          src={
            getYouTubeThumbnail(match.youtube_url ?? "") || "/placeholder.svg"
          }
          alt=""
        />
        <div className={styles.playIcon}>
          <PlayIcon />
        </div>
      </div>
      <div className={styles.matchInfo}>
        <h2 className={styles.matchTitle}>
          <>
            <TeamDisplay players={match.teams?.teamA} />
            <span className={styles.vs}> vs </span>
            <TeamDisplay players={match.teams?.teamB} />
          </>
        </h2>
        <div className={styles.matchMeta}>
          <span className={styles.metaItem}>
            <CalendarIcon />
            {formatDate(match.match_date)}
          </span>
          {match.location && (
            <span className={styles.metaItem}>
              <LocationIcon />
              {match.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
