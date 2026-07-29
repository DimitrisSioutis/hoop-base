"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Player, MatchWithStats } from "@/lib/types";

export interface PlayerStatsForm {
  playerId: string;
  team: "team_a" | "team_b";
  points: number;
  rebounds: string;
  assists: string;
  steals: string;
  blocks: string;
  turnovers: string;
}

export function useMatchForm(match?: MatchWithStats) {
  const isEditMode = !!match;
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStatsForm>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState<"team_a" | "team_b" | null>(null);

  const [formData, setFormData] = useState({
    youtube_url: match?.youtube_url || "",
    match_date: match?.match_date || "",
    location: match?.location || "",
  });

  useEffect(() => {
    async function fetchPlayers() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("players")
        .select("*")
        .order("name", { ascending: true });

      if (!data) return;
      setPlayers(data);

      if (!match?.player_stats) return;

      const teamAIds: string[] = [];
      const teamBIds: string[] = [];
      const statsMap: Record<string, PlayerStatsForm> = {};

      match.player_stats.forEach((stat) => {
        if (stat.team === "team_a") {
          teamAIds.push(stat.player_id);
        } else {
          teamBIds.push(stat.player_id);
        }
        statsMap[stat.player_id] = {
          playerId: stat.player_id,
          team: stat.team,
          points: stat.points,
          rebounds: stat.rebounds?.toString() || "",
          assists: stat.assists?.toString() || "",
          steals: stat.steals?.toString() || "",
          blocks: stat.blocks?.toString() || "",
          turnovers: stat.turnovers?.toString() || "",
        };
      });

      setTeamA(teamAIds);
      setTeamB(teamBIds);
      setPlayerStats(statsMap);
    }

    fetchPlayers();
  }, [match]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addPlayerToTeam = (playerId: string, team: "team_a" | "team_b") => {
    if (team === "team_a") {
      setTeamB((prev) => prev.filter((id) => id !== playerId));
    } else {
      setTeamA((prev) => prev.filter((id) => id !== playerId));
    }

    const currentTeam = team === "team_a" ? teamA : teamB;
    if (currentTeam.includes(playerId)) return;

    if (team === "team_a") {
      setTeamA((prev) => [...prev, playerId]);
    } else {
      setTeamB((prev) => [...prev, playerId]);
    }

    setPlayerStats((prev) => ({
      ...prev,
      [playerId]: {
        playerId,
        team,
        points: 0,
        rebounds: "",
        assists: "",
        steals: "",
        blocks: "",
        turnovers: "",
      },
    }));
  };

  const removePlayerFromTeam = (playerId: string) => {
    setTeamA((prev) => prev.filter((id) => id !== playerId));
    setTeamB((prev) => prev.filter((id) => id !== playerId));
    setPlayerStats((prev) => {
      const next = { ...prev };
      delete next[playerId];
      return next;
    });
  };

  const handleStatChange = (
    playerId: string,
    stat: keyof Omit<PlayerStatsForm, "playerId" | "team">,
    value: string,
  ) => {
    setPlayerStats((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [stat]:
          stat === "points"
            ? Math.max(0, Number.parseInt(value) || 0)
            : value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (teamA.length === 0 && teamB.length === 0) {
      setError("Please select at least one player for either team");
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      let matchId: string;

      if (isEditMode && match) {
        const { error: matchError } = await supabase
          .from("matches")
          .update({
            youtube_url: formData.youtube_url || null,
            match_date: formData.match_date,
            location: formData.location || null,
          })
          .eq("id", match.id);

        if (matchError) throw matchError;
        matchId = match.id;

        const { error: deleteError } = await supabase
          .from("player_stats")
          .delete()
          .eq("match_id", match.id);

        if (deleteError) throw deleteError;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: newMatch, error: matchError } = await supabase
          .from("matches")
          .insert({
            youtube_url: formData.youtube_url || null,
            match_date: formData.match_date,
            location: formData.location || null,
            created_by: user?.id,
          })
          .select()
          .single();

        if (matchError) throw matchError;
        matchId = newMatch.id;
      }

      const allPlayers = [...teamA, ...teamB];
      if (allPlayers.length > 0) {
        const statsToInsert = allPlayers.map((playerId) => {
          const stats = playerStats[playerId];
          return {
            match_id: matchId,
            player_id: playerId,
            team: stats.team,
            points: stats.points,
            rebounds: stats.rebounds ? Number.parseInt(stats.rebounds) : null,
            assists: stats.assists ? Number.parseInt(stats.assists) : null,
            steals: stats.steals ? Number.parseInt(stats.steals) : null,
            blocks: stats.blocks ? Number.parseInt(stats.blocks) : null,
            turnovers: stats.turnovers ? Number.parseInt(stats.turnovers) : null,
          };
        });

        const { error: statsError } = await supabase
          .from("player_stats")
          .insert(statsToInsert);

        if (statsError) throw statsError;
      }

      setSuccess(true);
      setTimeout(() => router.push(`/matches/${matchId}`), 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "Failed to update match"
            : "Failed to create match",
      );
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePlayers = (forTeam: "team_a" | "team_b") => {
    const otherTeam = forTeam === "team_a" ? teamB : teamA;
    return players.filter((p) => !otherTeam.includes(p.id));
  };

  const isPlayerInTeam = (playerId: string, team: "team_a" | "team_b") =>
    team === "team_a" ? teamA.includes(playerId) : teamB.includes(playerId);

  return {
    isEditMode,
    players,
    teamA,
    teamB,
    playerStats,
    loading,
    error,
    success,
    modalOpen,
    setModalOpen,
    formData,
    selectedPlayers: [...teamA, ...teamB],
    handleInputChange,
    addPlayerToTeam,
    removePlayerFromTeam,
    handleStatChange,
    handleSubmit,
    getAvailablePlayers,
    isPlayerInTeam,
  };
}
