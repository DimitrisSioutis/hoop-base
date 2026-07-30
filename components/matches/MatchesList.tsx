"use client";
import Link from "next/link";
import {
  EmptyState,
  VideoIcon,
  PlusIcon,
  formatDate,
  VerticalIcon,
  LinearIcon,
  MonthViewIcon,
  YearViewIcon,
  BigSizeIcon,
  SmallSizeIcon,
} from "@/components/shared";
import { MatchCard, CardSize } from "./MatchCard";
import styles from "./matches-list.module.scss";
import { useEffect, useState } from "react";

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

enum ViewType {
  Year = "year",
  Month = "month",
}

enum LayoutType {
  Linear = "linear",
  Vertical = "vertical",
}

export function MatchesList({
  matchesFormattedByYear,
  isAdmin,
}: MatchesListProps) {

  const [view, setView] = useState<ViewType>(ViewType.Month);
  const [layout, setLayout] = useState<LayoutType>(LayoutType.Linear);
  const [cardSize, setCardSize] = useState<CardSize>(CardSize.Small);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Matches</h1>
        {isAdmin && (
          <Link href="/admin/matches/new">
            <PlusIcon />
          </Link>
        )}
      </header>

      <div className={styles.viewToggle}>
        <button
          className={`${styles.viewButton} ${view === ViewType.Month ? styles.viewButtonActive : ''}`}
          onClick={() => setView(ViewType.Month)}
        >
          <MonthViewIcon/>
        </button>
        <button
          className={`${styles.viewButton} ${view === ViewType.Year ? styles.viewButtonActive : ''}`}
          onClick={() => setView(ViewType.Year)}
        >
          <YearViewIcon/>
        </button>
        <button
          className={`${styles.viewButton} ${layout === LayoutType.Linear ? styles.viewButtonActive : ''}`}
          onClick={() => setLayout(LayoutType.Linear)}
        >
          <LinearIcon />
        </button>
        <button
          className={`${styles.viewButton} ${layout === LayoutType.Vertical ? styles.viewButtonActive : ''}`}
          onClick={() => setLayout(LayoutType.Vertical)}
        >
          <VerticalIcon />
        </button>
        <button
          className={`${styles.viewButton} ${cardSize === CardSize.Small ? styles.viewButtonActive : ''}`}
          onClick={() => setCardSize(CardSize.Small)}
        >
          <SmallSizeIcon />
        </button>
        <button
          className={`${styles.viewButton} ${cardSize === CardSize.Big ? styles.viewButtonActive : ''}`}
          onClick={() => setCardSize(CardSize.Big)}
        >
          <BigSizeIcon />
        </button>
      </div>

      <div>
        {matchesFormattedByYear && matchesFormattedByYear.length > 0 ? (
          matchesFormattedByYear.map((yearGroup, index) => (
            <div key={index} className={styles.yearGroup}>
              <h1>{yearGroup.year}</h1>
              {view === ViewType.Month ? (
                yearGroup.months.map((month) => (
                  <div key={month.monthIndex} className={styles.monthGroup}>
                    {month.matches.length > 0 && (
                      <>
                        <h2>
                          {Intl.DateTimeFormat("en", { month: "long" }).format(
                            new Date(2024, month.monthIndex, 1),
                          )}
                        </h2>

                        <div className={`${styles.monthWrapper} ${layout === LayoutType.Vertical ? styles.monthWrapperGrid : ''}`}>
                          {month.matches.map((match: Match) => (
                            <MatchCard key={match.id} match={match} size={cardSize} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.monthGroup}>
                  <div className={`${styles.monthWrapper} ${layout === LayoutType.Vertical ? styles.monthWrapperGrid : ''}`}>
                    {yearGroup.months.flatMap((month) => month.matches).map((match: Match) => (
                      <MatchCard key={match.id} match={match} size={cardSize} />
                    ))}
                  </div>
                </div>
              )}
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
