"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Player } from "@/lib/types";
import {
  PlayerAvatar,
  EmptyState,
  TrophyIcon,
  calculateAveragePI,
  calculateWinsLosses,
} from "@/components/shared";
import styles from "./leaderboard-content.module.scss";
import {
  mapPlayersStats,
  PlayerLeaderboardData,
  PlayerStat,
  PlayerWithStats,
} from "./utils";

type StatCategory =
  | "points"
  | "rebounds"
  | "assists"
  | "steals"
  | "blocks"
  | "pi";

export function LeaderboardContent() {
  const [category, setCategory] = useState<StatCategory>("points");
  const [players, setPlayers] = useState<PlayerLeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);

  const categories: { label: string; value: StatCategory }[] = [
    { label: "PPG", value: "points" },
    { label: "RPG", value: "rebounds" },
    { label: "APG", value: "assists" },
    { label: "SPG", value: "steals" },
    { label: "BPG", value: "blocks" },
    { label: "PI", value: "pi" },
  ];

  const desktopStats = [
    { key: "points", label: "PPG", decimals: 1 },
    { key: "rebounds", label: "RPG", decimals: 1 },
    { key: "assists", label: "APG", decimals: 1 },
    { key: "steals", label: "SPG", decimals: 1 },
    { key: "blocks", label: "BPG", decimals: 1 },
  ] as const;

  const mobileStats = [
    { key: "points", label: "PPG", decimals: 1 },
    { key: "rebounds", label: "RPG", decimals: 1 },
    { key: "assists", label: "APG", decimals: 1 },
  ] as const;

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowserClient();

      const { data: stats } = await supabase.from("player_stats").select(`
          player_id,
          match_id,
          team,
          points,
          rebounds,
          assists,
          steals,
          blocks,
          turnovers,
          players(*)
        `);

      if (!stats) {
        setLoading(false);
        return;
      }

      const { data: players } = await supabase
        .from("players")
        .select("id,name,avatar_url");

      const playersArray = mapPlayersStats(players, stats as PlayerStat[]);

      setPlayers(playersArray);
      setLoading(false);
    }

    fetchData();
  }, []);

  const sortedPlayers = [...players].sort((a, b) => {
    switch (category) {
      case "points":
        return b.points - a.points;
      case "rebounds":
        return b.rebounds - a.rebounds;
      case "assists":
        return b.assists - a.assists;
      case "steals":
        return b.steals - a.steals;
      case "blocks":
        return b.blocks - a.blocks;
      case "pi":
        return b.pi - a.pi;
      default:
        return 0;
    }
  });

  return (
    <>
      <div className={styles.leaderboardCard}>
        {!loading && sortedPlayers.length > 0 ? (
          <>
            <div className={styles.tableHeader}>
              <span className={styles.tableHeaderCell}>#</span>
              <span className={styles.tableHeaderCell}>Player</span>
              <span className={styles.tableHeaderCell}>W-L</span>
              <span className={styles.tableHeaderCell}>GP</span>
              {categories.map((cat) => (
                <span
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`${styles.tableHeaderCell} ${styles.tableHeaderCellClickable} ${category === cat.value ? styles.activeTab : ""} ${cat.value === "points" || cat.value === "rebounds" || cat.value === "assists" ? styles.hideMobile : ""}`}
                >
                  {cat.label}
                </span>
              ))}
            </div>

            <div className={styles.leaderboardRows}>
              {sortedPlayers.map((playerData, index) => {
                const { player, wins, losses, games, ...stats } = playerData;

                return (
                  <Link
                    key={playerData.id}
                    href={`/players/${playerData.id}`}
                    className={styles.leaderboardRow}
                  >
                    <div className={styles.rankCell}>
                      <span className={styles.rank}>{index + 1}</span>
                    </div>

                    <div className={styles.playerCell}>
                      <PlayerAvatar
                        avatarUrl={player.avatar_url}
                        name={player.name}
                        size="lg"
                      />
                      <div className={styles.playerInfo}>
                        <span className={styles.playerName}>
                          {player.name || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.statCell}>
                      <span
                        className={`${styles.statValue} ${styles.highlight}`}
                      >
                        <span className={styles.wins}>{wins}</span>-
                        <span className={styles.losses}>{losses}</span>
                      </span>
                    </div>

                    <div className={styles.statCell}>
                      <span className={styles.statValue}>{games}</span>
                    </div>

                    {desktopStats.map(({ key, decimals }) => (
                      <div
                        key={key}
                        className={`${styles.statCell} ${styles.hideMobile}`}
                      >
                        <span
                          className={`${styles.statValue} ${key === category ? styles.activeCategory : ""}`}
                        >
                          {Number(stats[key]).toFixed(decimals)}
                        </span>
                      </div>
                    ))}

                    {/* Mobile condensed stats */}
                    <div className={styles.mobileStats}>
                      {/* W-L highlight */}
                      <div className={styles.mobileStat}>
                        <span
                          className={`${styles.mobileStatValue} ${styles.highlight}`}
                        >
                          {wins}-{losses}
                        </span>
                        <span className={styles.mobileStatLabel}>W-L</span>
                      </div>

                      {/* Other mobile stats */}
                      {mobileStats.map(({ key, label, decimals }) => (
                        <div key={key} className={styles.mobileStat}>
                          <span className={styles.mobileStatValue}>
                            {Number(stats[key]).toFixed(decimals)}
                          </span>
                          <span className={styles.mobileStatLabel}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : loading ? (
          <EmptyState
            icon={<TrophyIcon />}
            message="Loading leaderboard..."
            large
          />
        ) : (
          <EmptyState
            icon={<TrophyIcon />}
            title="No Stats Yet"
            message="Play some games to see the leaderboard!"
            large
          />
        )}
      </div>
    </>
  );
}
