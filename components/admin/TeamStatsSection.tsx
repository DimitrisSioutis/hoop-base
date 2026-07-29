import type { Player } from "@/lib/types";
import { PlayerAvatar } from "@/components/shared";
import type { PlayerStatsForm } from "./hooks/useMatchForm";
import { StatNumberInput } from "./StatNumberInput";
import styles from "./new-match-content.module.scss";

interface TeamStatsSectionProps {
  label: string;
  teamStyle: string;
  playerIds: string[];
  players: Player[];
  playerStats: Record<string, PlayerStatsForm>;
  onStatChange: (
    playerId: string,
    stat: keyof Omit<PlayerStatsForm, "playerId" | "team">,
    value: string,
  ) => void;
}

export function TeamStatsSection({
  label,
  teamStyle,
  playerIds,
  players,
  playerStats,
  onStatChange,
}: TeamStatsSectionProps) {
  if (playerIds.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h4 className={`${styles.teamHeader} ${teamStyle}`}>{label}</h4>
      {playerIds.map((playerId) => {
        const player = players.find((p) => p.id === playerId);
        const stats = playerStats[playerId];
        if (!player || !stats) return null;

        return (
          <div key={playerId} className={styles.playerStatRow}>
            <div className={styles.playerStatHeader}>
              <PlayerAvatar avatarUrl={player.avatar_url} name={player.name} size="md" />
              <span className={styles.playerStatName}>{player.name}</span>
            </div>
            <div className={styles.playerStatInputs}>
              <StatNumberInput label="PTS" value={stats.points} onChange={(v) => onStatChange(playerId, "points", v)} required />
              <StatNumberInput label="REB" value={stats.rebounds} onChange={(v) => onStatChange(playerId, "rebounds", v)} placeholder="-" />
              <StatNumberInput label="AST" value={stats.assists} onChange={(v) => onStatChange(playerId, "assists", v)} placeholder="-" />
              <StatNumberInput label="STL" value={stats.steals} onChange={(v) => onStatChange(playerId, "steals", v)} placeholder="-" />
              <StatNumberInput label="BLK" value={stats.blocks} onChange={(v) => onStatChange(playerId, "blocks", v)} placeholder="-" />
              <StatNumberInput label="TO" value={stats.turnovers} onChange={(v) => onStatChange(playerId, "turnovers", v)} placeholder="-" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
