import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MatchesList } from "@/components/matches";
import styles from "./matches.module.scss";
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
        teamA:
          player_stats
            ?.filter((ps: PlayerStatsWithPlayer) => ps.team === "team_a")
            .map((ps: PlayerStatsWithPlayer) => ps.players) || [],
        teamB:
          player_stats
            ?.filter((ps: PlayerStatsWithPlayer) => ps.team === "team_b")
            .map((ps: PlayerStatsWithPlayer) => ps.players) || [],
      },
    };
  });

  if (yearsArray && matchesWithTeams) {
    for (let i = 0; i < yearsArray.length; i++) {
      const months = Array(12)
        .fill(null)
        .map((_, monthIndex) => {
          return matchesWithTeams.filter((match) => {
            const matchDate = new Date(match.match_date);
            const month = matchDate.getMonth();
            const matchYear = matchDate.getFullYear();
            return matchYear === yearsArray[i] && month === monthIndex;
          });
        });
      matchesFormattedByYear.push({ year: yearsArray[i], months });
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <MatchesList
          matchesFormattedByYear={matchesFormattedByYear ?? null}
          isAdmin={appUser?.is_admin || false}
        />
      </main>
    </div>
  );
}
