import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { notFound } from "next/navigation";
import { PlayerDetailContent } from "@/components/players";
import { calculateAveragePI } from "@/components/shared";
import styles from "./player-detail.module.scss";
import { GameStat } from "@/components/players/PlayerDetailContent";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  // Fetch player
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (!player) {
    notFound();
  }

  // Fetch player's game stats with match info
  const { data: playerGameStats } = await supabase
    .from("player_stats")
    .select(`*, matches(id, match_date, location)`)
    .eq("player_id", id)
    .order("created_at", { ascending: false });

  // Fetch all stats for PI calculation (need match context)
  const { data: allStats } = await supabase
    .from("player_stats")
    .select(`player_id, match_id, team, points, rebounds, assists, turnovers`);

  // Calculate career averages (only count non-null values)
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

  const gamesPlayed = playerGameStats?.length || 0;

  // Calculate average PI
  const avgPI = allStats ? calculateAveragePI(id, allStats as any) : 0;

  const averages = {
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

  let wins = 0;
  let losses = 0;

  const updatedPlayerGameStats = playerGameStats?.map((match) => {
    const playersTeam = match.team;

    const allStatsFromMatch =
      allStats?.filter((s) => s.match_id === match.match_id) || [];

    const teammatesPoints = allStatsFromMatch
      .filter((s) => s.team === playersTeam)
      .reduce((sum, s) => sum + s.points, 0);

    const opponentsPoints = allStatsFromMatch
      .filter((s) => s.team !== playersTeam)
      .reduce((sum, s) => sum + s.points, 0);

    const win = teammatesPoints > opponentsPoints;
    win ? wins++ : losses++;

    return {
      ...match,
      result: win ? "win" : "lose",
    };
  }) as GameStat[];

  return (
    <PlayerDetailContent
      player={player}
      gameStats={updatedPlayerGameStats}
      averages={averages}
      gamesPlayed={gamesPlayed}
      wins={wins}
      losses={losses}
    />
  );
}
