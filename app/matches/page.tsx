import { MatchesList } from "@/components/matches/MatchesList";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PlayerStatsWithPlayer } from "@/lib/types";

export default async function MatchesPage() {
  const supabase = await getSupabaseServerClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: appUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user?.id)
    .single();

  // Fetch matches with player stats
  const { data: matches } = await supabase
    .from("matches")
    .select(
      `
      *,
      player_stats (
        team,
        points,
        players (
          name,
          avatar_url
        )
      )
    `,
    )
    .order("match_date", { ascending: false });

  const differentYears = new Set(
    matches?.map((match) => {
      const date = new Date(match.match_date);
      return date.getFullYear();
    }),
  );

  const yearsArray = Array.from(differentYears);
  const matchesFormattedByYear = [];

  const matchesWithTeams = matches?.map((match) => {
    const { player_stats, ...rest } = match;

    return {
      ...rest,
      teams: {
        teamA: {
          points:
            match.player_stats
              ?.filter((ps: PlayerStatsWithPlayer) => ps.team === "team_a")
              .reduce(
                (sum: number, ps: PlayerStatsWithPlayer) => sum + ps.points,
                0,
              ) || 0,
          players:
            player_stats
              ?.filter((ps: PlayerStatsWithPlayer) => ps.team === "team_a")
              .map((ps: PlayerStatsWithPlayer) => ps.players) || [],
        },
        teamB: {
          points:
            match.player_stats
              ?.filter((ps: PlayerStatsWithPlayer) => ps.team === "team_b")
              .reduce(
                (sum: number, ps: PlayerStatsWithPlayer) => sum + ps.points,
                0,
              ) || 0,
          players:
            player_stats
              ?.filter((ps: PlayerStatsWithPlayer) => ps.team === "team_b")
              .map((ps: PlayerStatsWithPlayer) => ps.players) || [],
        },
      },
    };
  });

  if (yearsArray && matchesWithTeams) {
    for (let i = 0; i < yearsArray.length; i++) {
      const months = Array(12)
        .fill(null)
        .map((_, monthIndex) => {
          return {
            monthIndex,
            matches: matchesWithTeams.filter((match) => {
              const matchDate = new Date(match.match_date);
              const month = matchDate.getMonth();
              const matchYear = matchDate.getFullYear();
              return matchYear === yearsArray[i] && month === monthIndex;
            }),
          };
        })
        .reverse();
      matchesFormattedByYear.push({ year: yearsArray[i], months });
    }
  }

  return (
    <MatchesList
      matchesFormattedByYear={matchesFormattedByYear ?? null}
      isAdmin={appUser?.is_admin || false}
    />
  );
}
