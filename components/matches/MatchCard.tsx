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

export enum CardSize {
  Small = "small",
  Big = "big",
}

const cardSizeClass: Record<CardSize, string> = {
  [CardSize.Small]: styles.cardSizeSmall,
  [CardSize.Big]: styles.cardSizeBig,
};

interface MatchCardProplayer {
  match: {
    id: string;
    youtube_url: string | null;
    match_date: string;
    location: string | null;
    teams?: any;
  };
  size?: CardSize;
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
            style={{width: `${100/players.length}%`}}
          >
            {player.avatar_url ? (
              <PlayerAvatar
                avatarUrl={player.avatar_url}
                name={player.name}
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

export function MatchCard({ match, size = CardSize.Small }: MatchCardProplayer) {
  return (
    <Link href={`/matches/${match.id}`} className={`${styles.matchCard} ${cardSizeClass[size]}`}>
      <div className={styles.thumbnail}>
        <img
          src={
            getYouTubeThumbnail(match.youtube_url ?? "") || "/placeholder.svg"
          }
          alt=""
        />
        <div className={`${styles.playIcon} ${size === CardSize.Small ? styles.playIconSmall : ''}`}>
          <PlayIcon />
        </div>
      </div>
      <div className={styles.matchInfo}>
        <h2 className={styles.matchTitle}>
          <>
            <TeamDisplay players={match.teams?.teamA.players} />
              <span className={styles.score}>
              <span
                className={
                  match.teams?.teamA.points > match.teams?.teamB.points
                    ? styles.win
                    : styles.loss
                }
              >
                {match.teams?.teamA.points}
              </span>
              <span className={styles.vs}> vs </span>
              <span
                className={
                  match.teams?.teamB.points > match.teams?.teamA.points
                    ? styles.win
                    : styles.loss
                }
              >
                {match.teams?.teamB.points}
              </span>
            </span>
            <TeamDisplay players={match.teams?.teamB.players} />
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
