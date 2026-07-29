"use client";

import Link from "next/link";
import type { MatchWithStats } from "@/lib/types";
import { PlayerAvatar, SuccessIcon, ErrorIcon, CloseIcon, PlusIcon } from "@/components/shared";
import { useMatchForm } from "./hooks/useMatchForm";
import { PlayerSelectionModal } from "./PlayerSelectionModal";
import { TeamStatsSection } from "./TeamStatsSection";
import styles from "./new-match-content.module.scss";

interface MatchFormProps {
  match?: MatchWithStats;
}

export function MatchForm({ match }: MatchFormProps) {
  const {
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
    selectedPlayers,
    handleInputChange,
    addPlayerToTeam,
    removePlayerFromTeam,
    handleStatChange,
    handleSubmit,
    getAvailablePlayers,
    isPlayerInTeam,
  } = useMatchForm(match);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {isEditMode ? "Edit Match" : "Add New Match"}
        </h1>
        <p className={styles.subtitle}>
          {isEditMode
            ? "Update match details and player stats"
            : "Record a new game with video and player stats"}
        </p>
      </header>

      <div className={styles.formCard}>
        {success && (
          <div className={styles.successMessage}>
            <SuccessIcon />
            {isEditMode ? "Match updated successfully!" : "Match created successfully!"}{" "}
            Redirecting...
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <ErrorIcon />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Match details */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>YouTube URL</label>
            <input
              type="url"
              name="youtube_url"
              value={formData.youtube_url}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="https://youtube.com/watch?v=..."
            />
            <span className={styles.formHelp}>
              Paste the full YouTube video URL (optional)
            </span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Match Date <span className={styles.formRequired}>*</span>
              </label>
              <input
                type="date"
                name="match_date"
                value={formData.match_date}
                onChange={handleInputChange}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="e.g., Downtown Court"
              />
            </div>
          </div>

          {/* Team selection */}
          <div className={styles.teamSelection}>
            {(["team_a", "team_b"] as const).map((team) => {
              const teamIds = team === "team_a" ? teamA : teamB;
              const label = team === "team_a" ? "Team A" : "Team B";
              return (
                <div key={team} className={styles.teamColumn}>
                  <h3 className={styles.teamTitle}>{label}</h3>
                  <div className={styles.teamPlayers}>
                    {teamIds.map((playerId) => {
                      const player = players.find((p) => p.id === playerId);
                      if (!player) return null;
                      return (
                        <div key={playerId} className={styles.playerChip}>
                          <PlayerAvatar avatarUrl={player.avatar_url} name={player.name} size="md" />
                          <button
                            type="button"
                            className={styles.removePlayer}
                            onClick={() => removePlayerFromTeam(playerId)}
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      className={styles.addPlayerButton}
                      onClick={() => setModalOpen(team)}
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className={styles.vsText}>vs</div>
          </div>

          {modalOpen && (
            <PlayerSelectionModal
              team={modalOpen}
              players={getAvailablePlayers(modalOpen)}
              isPlayerInTeam={isPlayerInTeam}
              onAdd={addPlayerToTeam}
              onRemove={removePlayerFromTeam}
              onClose={() => setModalOpen(null)}
            />
          )}

          {selectedPlayers.length > 0 && (
            <div className={styles.statsEntry}>
              <div className={styles.teamsWrapper}>
                <TeamStatsSection
                  label="Team A"
                  teamStyle={styles.teamA}
                  playerIds={teamA}
                  players={players}
                  playerStats={playerStats}
                  onStatChange={handleStatChange}
                />
                <TeamStatsSection
                  label="Team B"
                  teamStyle={styles.teamB}
                  playerIds={teamB}
                  players={players}
                  playerStats={playerStats}
                  onStatChange={handleStatChange}
                />
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading
                ? isEditMode ? "Updating..." : "Creating..."
                : isEditMode ? "Update Match" : "Create Match"}
            </button>
            <Link
              href={isEditMode && match ? `/matches/${match.id}` : "/matches"}
              className={styles.cancelButton}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export function NewMatchContent() {
  return <MatchForm />;
}
