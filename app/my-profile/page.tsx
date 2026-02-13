import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PlayerDetailContent } from "@/components/players/PlayerDetailContent";
import { calculateCareerAverages, annotateGameResults, MatchPlayerStat } from "@/components/shared";

export default async function MyProfilePage() {
  const supabase = await getSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch app user
  const { data: appUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // If user doesn't have a linked player, redirect to matches
  if (!appUser?.player_id) {
    redirect("/matches");
  }

  const id = appUser.player_id;

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
    .select(`player_id, match_id, team, points, rebounds, assists, turnovers, steals, blocks`);

  const gamesPlayed = playerGameStats?.length || 0;

  const averages = calculateCareerAverages(playerGameStats, id, allStats as MatchPlayerStat[]);

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
