import { calculateAveragePI, annotateGameResults, MatchPlayerStat } from "@/components/shared";

export interface Player {
  id: string;
  name: string;
  avatar_url: string;
}

export interface PlayerWithStats {
  id: string;
  name: string;
  avatar_url?: string | null;
  position?: string | null;
  jersey_number?: number | null;
  stats: MatchPlayerStat[];
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  nickname?: string | null;
  avatar_url?: string | null;
  position?: string | null;
  jersey_number?: number | null;
}

export interface PlayerLeaderboardData {
  id: string;
  player: LeaderboardPlayer;
  games: number;
  wins: number;
  losses: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  pi: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
}

export function mapPlayersStats(
  players: Player[],
  stats: MatchPlayerStat[],
): PlayerLeaderboardData[] {
  return players.map((player) => {
    const playerStats = stats.filter((stat) => stat.player_id === player.id);
    const games = playerStats.length;

    const { wins, losses } = annotateGameResults(playerStats, stats);

    const gamesWithPoints = playerStats.filter(
      (stat) => stat.points != null,
    ).length;
    const gamesWithRebounds = playerStats.filter(
      (stat) => stat.rebounds != null,
    ).length;
    const gamesWithAssists = playerStats.filter(
      (stat) => stat.assists != null,
    ).length;
    const gamesWithSteals = playerStats.filter(
      (stat) => stat.steals != null,
    ).length;
    const gamesWithBlocks = playerStats.filter(
      (stat) => stat.blocks != null,
    ).length;

    const totalPoints = playerStats.reduce(
      (sum, stat) => sum + (stat.points || 0),
      0,
    );
    const totalRebounds = playerStats.reduce(
      (sum, stat) => sum + (stat.rebounds || 0),
      0,
    );
    const totalAssists = playerStats.reduce(
      (sum, stat) => sum + (stat.assists || 0),
      0,
    );
    const totalSteals = playerStats.reduce(
      (sum, stat) => sum + (stat.steals || 0),
      0,
    );
    const totalBlocks = playerStats.reduce(
      (sum, stat) => sum + (stat.blocks || 0),
      0,
    );

    const avgPI = calculateAveragePI(player.id, stats);

    return {
      id: player.id,
      player: {
        id: player.id,
        name: player.name,
        avatar_url: player.avatar_url,
      },
      games,
      wins,
      losses,
      points: gamesWithPoints > 0 ? totalPoints / gamesWithPoints : 0,
      rebounds: gamesWithRebounds > 0 ? totalRebounds / gamesWithRebounds : 0,
      assists: gamesWithAssists > 0 ? totalAssists / gamesWithAssists : 0,
      steals: gamesWithSteals > 0 ? totalSteals / gamesWithSteals : 0,
      blocks: gamesWithBlocks > 0 ? totalBlocks / gamesWithBlocks : 0,
      pi: avgPI,
      totalPoints,
      totalRebounds,
      totalAssists,
      totalSteals,
      totalBlocks,
    };
  });
}
