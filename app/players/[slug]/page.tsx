import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PlayerDetailContent } from "@/components/players";
import { calculateCareerAverages, annotateGameResults, MatchPlayerStat } from "@/components/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PlayerDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();

  // Fetch player by slug
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!player) {
    notFound();
  }

  // Fetch player's game stats with match info
  const { data: playerGameStats } = await supabase
    .from("player_stats")
    .select(`*, matches(id, match_date, location)`)
    .eq("player_id", player.id)
    .order("created_at", { ascending: false });

  // Fetch all stats for PI calculation (need match context)
  const { data: allStats } = await supabase
    .from("player_stats")
    .select(`player_id, match_id, team, points, rebounds, assists, turnovers, steals, blocks`);

  const gamesPlayed = playerGameStats?.length || 0;

  const averages = calculateCareerAverages(playerGameStats, player.id, allStats as MatchPlayerStat[]);

  const { annotatedStats: updatedPlayerGameStats, wins, losses } =
    annotateGameResults(playerGameStats, allStats as MatchPlayerStat[]);

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
