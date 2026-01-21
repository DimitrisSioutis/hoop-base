import Link from "next/link";
import {
  EmptyState,
  VideoIcon,
  PlusIcon,
  formatDate,
} from "@/components/shared";
import { MatchCard } from "./MatchCard";
import styles from "./matches-list.module.scss";

interface PlayerStats {
  player_id: string;
  team: string;
  players?: {
    name: string;
    avatar_url: string | null;
  } | null;
}

interface Match {
  id: string;
  youtube_url: string | null;
  match_date: string;
  location: string | null;
  teams?: PlayerStats[];
}

interface MatchesFormmatedByYears {
  year: number;
  months: Array<any>;
}

interface MatchesListProps {
  matchesFormattedByYear: MatchesFormmatedByYears[] | null;
  isAdmin: boolean;
}

export function MatchesList({
  matchesFormattedByYear,
  isAdmin,
}: MatchesListProps) {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Matches</h1>
        {isAdmin && (
          <Link href="/admin/matches/new" className={styles.addButton}>
            <PlusIcon />
            Add Match
          </Link>
        )}
      </header>

      <div className={styles.matchesContainer}>
        {matchesFormattedByYear && matchesFormattedByYear.length > 0 ? (
          matchesFormattedByYear.map((yearGroup, index) => (
            <div key={index} className={styles.yearGroup}>
              <h1>{yearGroup.year}</h1>
              {yearGroup.months.map((month, monthIndex) => (
                <div key={monthIndex} className={styles.monthGroup}>
                  {month.length > 0 && (
                    <>
                      <h2>
                        {Intl.DateTimeFormat("en", { month: "long" }).format(
                          new Date(2024, monthIndex, 1),
                        )}
                      </h2>

                      <div className={styles.monthWrapper}>
                        {month.map((match: Match) => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <EmptyState
            icon={<VideoIcon />}
            title="No Matches Yet"
            message="Matches will appear here once they're added by an admin"
            large
            gridSpan
          />
        )}
      </div>
    </>
  );
}
