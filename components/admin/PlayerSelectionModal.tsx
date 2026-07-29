import type { Player } from "@/lib/types";
import { PlayerAvatar, CloseIcon, CheckIcon } from "@/components/shared";
import styles from "./new-match-content.module.scss";

interface PlayerSelectionModalProps {
  team: "team_a" | "team_b";
  players: Player[];
  isPlayerInTeam: (id: string, team: "team_a" | "team_b") => boolean;
  onAdd: (id: string, team: "team_a" | "team_b") => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function PlayerSelectionModal({
  team,
  players,
  isPlayerInTeam,
  onAdd,
  onRemove,
  onClose,
}: PlayerSelectionModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Add Players to {team === "team_a" ? "Team A" : "Team B"}</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.modalContent}>
          {players.map((player) => {
            const isSelected = isPlayerInTeam(player.id, team);
            return (
              <button
                key={player.id}
                type="button"
                className={`${styles.playerOption} ${isSelected ? styles.selected : ""}`}
                onClick={() =>
                  isSelected ? onRemove(player.id) : onAdd(player.id, team)
                }
              >
                <PlayerAvatar avatarUrl={player.avatar_url} name={player.name} size="sm" />
                <span className={styles.optionName}>{player.name || "Unknown"}</span>
                {isSelected && <CheckIcon />}
              </button>
            );
          })}
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.submitButton} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
