export const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateLong = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const getAvg = (arr: number[]) => {
  if (arr.length === 0) return "0.0";
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
};

export interface MatchPlayerStat {
  player_id: string;
  match_id: string;
  team: "team_a" | "team_b";
  points: number;
  rebounds: number | null;
  assists: number | null;
  turnovers: number | null;
  steals: number | null;
  blocks: number | null;
}

export const calculateMatchPI = (playerStat: MatchPlayerStat): number => {
  const points = playerStat.points ?? 0;
  const rebounds = playerStat.rebounds ?? 0;
  const assists = playerStat.assists ?? 0;
  const steals = playerStat.steals ?? 0;
  const blocks = playerStat.blocks ?? 0;
  const turnovers = playerStat.turnovers ?? 0;

  return (
    points +
    assists * 0.75 +
    rebounds * 0.5 +
    steals * 1 +
    blocks * 0.75 -
    turnovers * 1
  );
};

/**
 * Calculate average PI across all matches for a player
 */
export const calculateAveragePI = (
  playerId: string,
  allStats: MatchPlayerStat[],
): number => {
  const playerStats = allStats.filter((s) => s.player_id === playerId);

  if (playerStats.length === 0) return 0;

  const totalPI = playerStats.reduce((sum, stat) => {
    return sum + calculateMatchPI(stat);
  }, 0);

  return totalPI / playerStats.length;
};

/**
 * Calculate career averages for a player, including PI
 */
export const calculateCareerAverages = (
  playerGameStats: any[] | null,
  playerId: string,
  allStats: MatchPlayerStat[] | null,
) => {
  const totals = {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
  };
  const counts = {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
  };

  playerGameStats?.forEach((stat) => {
    totals.points += stat.points;
    counts.points += 1;
    if (stat.rebounds !== null) {
      totals.rebounds += stat.rebounds;
      counts.rebounds += 1;
    }
    if (stat.assists !== null) {
      totals.assists += stat.assists;
      counts.assists += 1;
    }
    if (stat.steals !== null) {
      totals.steals += stat.steals;
      counts.steals += 1;
    }
    if (stat.blocks !== null) {
      totals.blocks += stat.blocks;
      counts.blocks += 1;
    }
    if (stat.turnovers !== null) {
      totals.turnovers += stat.turnovers;
      counts.turnovers += 1;
    }
  });

  const avgPI = allStats ? calculateAveragePI(playerId, allStats) : 0;

  return {
    points:
      counts.points > 0 ? (totals.points / counts.points).toFixed(1) : "0.0",
    rebounds:
      counts.rebounds > 0
        ? (totals.rebounds / counts.rebounds).toFixed(1)
        : "-",
    assists:
      counts.assists > 0 ? (totals.assists / counts.assists).toFixed(1) : "-",
    steals:
      counts.steals > 0 ? (totals.steals / counts.steals).toFixed(1) : "-",
    blocks:
      counts.blocks > 0 ? (totals.blocks / counts.blocks).toFixed(1) : "-",
    turnovers:
      counts.turnovers > 0
        ? (totals.turnovers / counts.turnovers).toFixed(1)
        : "-",
    pi: avgPI.toFixed(1),
  };
};

/**
 * Annotate each player game stat with a win/lose result, and return win/loss counts.
 */
export const annotateGameResults = <
  T extends { match_id: string; team: string },
>(
  playerGameStats: T[] | null,
  allStats: MatchPlayerStat[] | null,
): {
  annotatedStats: (T & { result: "win" | "lose" })[] | null;
  wins: number;
  losses: number;
} => {
  if (!playerGameStats) return { annotatedStats: null, wins: 0, losses: 0 };

  let wins = 0;
  let losses = 0;

  const annotatedStats = playerGameStats.map((match) => {
    const allStatsFromMatch =
      allStats?.filter((s) => s.match_id === match.match_id) || [];

    const teammatesPoints = allStatsFromMatch
      .filter((s) => s.team === match.team)
      .reduce((sum, s) => sum + s.points, 0);

    const opponentsPoints = allStatsFromMatch
      .filter((s) => s.team !== match.team)
      .reduce((sum, s) => sum + s.points, 0);

    const win = teammatesPoints > opponentsPoints;
    win ? wins++ : losses++;

    return {
      ...match,
      result: (win ? "win" : "lose") as "win" | "lose",
    };
  });

  return { annotatedStats, wins, losses };
};
