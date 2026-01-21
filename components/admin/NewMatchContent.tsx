"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import type { Player, MatchWithStats } from "@/lib/types"
import { PlayerAvatar, SuccessIcon, ErrorIcon, CloseIcon, PlusIcon, CheckIcon } from "@/components/shared"
import styles from "./new-match-content.module.scss"

interface PlayerStatsForm {
  playerId: string
  team: 'team_a' | 'team_b'
  points: number
  rebounds: string
  assists: string
  steals: string
  blocks: string
  turnovers: string
}

interface MatchFormProps {
  match?: MatchWithStats
}

export function MatchForm({ match }: MatchFormProps) {
  const isEditMode = !!match
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [teamA, setTeamA] = useState<string[]>([])
  const [teamB, setTeamB] = useState<string[]>([])
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStatsForm>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [modalOpen, setModalOpen] = useState<'team_a' | 'team_b' | null>(null)

  const [formData, setFormData] = useState({
    description: "",
    youtube_url: match?.youtube_url || "",
    match_date: match?.match_date || "",
    location: match?.location || "",
  })

  useEffect(() => {
    async function fetchPlayers() {
      const supabase = getSupabaseBrowserClient()
      const { data } = await supabase.from("players").select("*").order("name", { ascending: true })

      if (data) {
        setPlayers(data)

        // Pre-fill teams and stats if editing
        if (match?.player_stats) {
          const teamAIds: string[] = []
          const teamBIds: string[] = []
          const statsMap: Record<string, PlayerStatsForm> = {}

          match.player_stats.forEach((stat) => {
            if (stat.team === 'team_a') {
              teamAIds.push(stat.player_id)
            } else {
              teamBIds.push(stat.player_id)
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
            }
          })

          setTeamA(teamAIds)
          setTeamB(teamBIds)
          setPlayerStats(statsMap)
        }
      }
    }

    fetchPlayers()
  }, [match])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addPlayerToTeam = (playerId: string, team: 'team_a' | 'team_b') => {
    if (team === 'team_a') {
      setTeamB((prev) => prev.filter((id) => id !== playerId))
    } else {
      setTeamA((prev) => prev.filter((id) => id !== playerId))
    }

    const currentTeam = team === 'team_a' ? teamA : teamB
    if (!currentTeam.includes(playerId)) {
      if (team === 'team_a') {
        setTeamA((prev) => [...prev, playerId])
      } else {
        setTeamB((prev) => [...prev, playerId])
      }

      setPlayerStats((prevStats) => ({
        ...prevStats,
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
      }))
    }
  }

  const removePlayerFromTeam = (playerId: string) => {
    setTeamA((prev) => prev.filter((id) => id !== playerId))
    setTeamB((prev) => prev.filter((id) => id !== playerId))
    const newStats = { ...playerStats }
    delete newStats[playerId]
    setPlayerStats(newStats)
  }

  const handleStatChange = (playerId: string, stat: keyof Omit<PlayerStatsForm, "playerId" | "team">, value: string) => {
    if (stat === 'points') {
      const numValue = Number.parseInt(value) || 0
      setPlayerStats((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [stat]: Math.max(0, numValue),
        },
      }))
    } else {
      setPlayerStats((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [stat]: value,
        },
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (teamA.length === 0 && teamB.length === 0) {
      setError("Please select at least one player for either team")
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseBrowserClient()

      let matchId: string

      if (isEditMode && match) {
        // Update existing match
        const { error: matchError } = await supabase
          .from("matches")
          .update({
            youtube_url: formData.youtube_url || null,
            match_date: formData.match_date,
            location: formData.location || null,
          })
          .eq("id", match.id)

        if (matchError) throw matchError
        matchId = match.id

        // Delete existing player stats and re-insert
        const { error: deleteError } = await supabase
          .from("player_stats")
          .delete()
          .eq("match_id", match.id)

        if (deleteError) throw deleteError
      } else {
        // Create new match
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data: newMatch, error: matchError } = await supabase
          .from("matches")
          .insert({
            youtube_url: formData.youtube_url || null,
            match_date: formData.match_date,
            location: formData.location || null,
            created_by: user?.id,
          })
          .select()
          .single()

        if (matchError) throw matchError
        matchId = newMatch.id
      }

      const allPlayers = [...teamA, ...teamB]
      if (allPlayers.length > 0) {
        const statsToInsert = allPlayers.map((playerId) => {
          const stats = playerStats[playerId]
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
          }
        })

        const { error: statsError } = await supabase.from("player_stats").insert(statsToInsert)

        if (statsError) throw statsError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/matches/${matchId}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditMode ? "Failed to update match" : "Failed to create match")
    } finally {
      setLoading(false)
    }
  }

  const getAvailablePlayers = (forTeam: 'team_a' | 'team_b') => {
    const otherTeam = forTeam === 'team_a' ? teamB : teamA
    return players.filter((p) => !otherTeam.includes(p.id))
  }

  const isPlayerInTeam = (playerId: string, team: 'team_a' | 'team_b') => {
    return team === 'team_a' ? teamA.includes(playerId) : teamB.includes(playerId)
  }

  const selectedPlayers = [...teamA, ...teamB]

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>{isEditMode ? "Edit Match" : "Add New Match"}</h1>
        <p className={styles.subtitle}>
          {isEditMode ? "Update match details and player stats" : "Record a new game with video and player stats"}
        </p>
      </header>

      <div className={styles.formCard}>
        {success && (
          <div className={styles.successMessage}>
            <SuccessIcon />
            {isEditMode ? "Match updated successfully!" : "Match created successfully!"} Redirecting...
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <ErrorIcon />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
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
            <span className={styles.formHelp}>Paste the full YouTube video URL (optional)</span>
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

          {/* Team Selection */}
          <div className={styles.teamSelection}>
            <div className={styles.teamColumn}>
              <h3 className={styles.teamTitle}>Team A</h3>
              <div className={styles.teamPlayers}>
                {teamA.map((playerId) => {
                  const player = players.find((p) => p.id === playerId)
                  if (!player) return null
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
                  )
                })}
                <button
                  type="button"
                  className={styles.addPlayerButton}
                  onClick={() => setModalOpen('team_a')}
                >
                  <PlusIcon />
                </button>
              </div>
            </div>

            <div className={styles.vsText}>vs</div>

            <div className={styles.teamColumn}>
              <h3 className={styles.teamTitle}>Team B</h3>
              <div className={styles.teamPlayers}>
                {teamB.map((playerId) => {
                  const player = players.find((p) => p.id === playerId)
                  if (!player) return null
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
                  )
                })}
                <button
                  type="button"
                  className={styles.addPlayerButton}
                  onClick={() => setModalOpen('team_b')}
                >
                  <PlusIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Player Selection Modal */}
          {modalOpen && (
            <div className={styles.modalOverlay} onClick={() => setModalOpen(null)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>Add Players to {modalOpen === 'team_a' ? 'Team A' : 'Team B'}</h3>
                  <button
                    type="button"
                    className={styles.modalClose}
                    onClick={() => setModalOpen(null)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className={styles.modalContent}>
                  {getAvailablePlayers(modalOpen).map((player) => {
                    const isSelected = isPlayerInTeam(player.id, modalOpen)
                    return (
                      <button
                        key={player.id}
                        type="button"
                        className={`${styles.playerOption} ${isSelected ? styles.selected : ''}`}
                        onClick={() => {
                          if (isSelected) {
                            removePlayerFromTeam(player.id)
                          } else {
                            addPlayerToTeam(player.id, modalOpen)
                          }
                        }}
                      >
                        <PlayerAvatar avatarUrl={player.avatar_url} name={player.name} size="sm" />
                        <span className={styles.optionName}>{player.name || "Unknown"}</span>
                        {isSelected && <CheckIcon />}
                      </button>
                    )
                  })}
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.submitButton}
                    onClick={() => setModalOpen(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Entry */}
          {selectedPlayers.length > 0 && (
            <div className={styles.statsEntry}>
              <h3 className={styles.statsEntryTitle}>Enter Player Stats</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Points are required. Other stats are optional - leave blank if not tracked.
              </p>

              {teamA.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 className={`${styles.teamHeader} ${styles.teamA}`}>Team A</h4>
                  {teamA.map((playerId) => {
                    const player = players.find((p) => p.id === playerId)
                    const stats = playerStats[playerId]
                    if (!player || !stats) return null

                    return (
                      <div key={playerId} className={styles.playerStatRow}>
                        <div className={styles.playerStatHeader}>
                          <PlayerAvatar avatarUrl={player.avatar_url} name={player.name} size="md" />
                          <span className={styles.playerStatName}>{player.name}</span>
                        </div>
                        <div className={styles.playerStatInputs}>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>PTS *</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.points}
                              onChange={(e) => handleStatChange(playerId, "points", e.target.value)}
                              className={styles.statInputField}
                              required
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>REB</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.rebounds}
                              onChange={(e) => handleStatChange(playerId, "rebounds", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>AST</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.assists}
                              onChange={(e) => handleStatChange(playerId, "assists", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>STL</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.steals}
                              onChange={(e) => handleStatChange(playerId, "steals", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>BLK</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.blocks}
                              onChange={(e) => handleStatChange(playerId, "blocks", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>TO</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.turnovers}
                              onChange={(e) => handleStatChange(playerId, "turnovers", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {teamB.length > 0 && (
                <div>
                  <h4 className={`${styles.teamHeader} ${styles.teamB}`}>Team B</h4>
                  {teamB.map((playerId) => {
                    const player = players.find((p) => p.id === playerId)
                    const stats = playerStats[playerId]
                    if (!player || !stats) return null

                    return (
                      <div key={playerId} className={styles.playerStatRow}>
                        <div className={styles.playerStatHeader}>
                          <PlayerAvatar avatarUrl={player.avatar_url} name={player.name} size="md" />
                          <span className={styles.playerStatName}>{player.name}</span>
                        </div>
                        <div className={styles.playerStatInputs}>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>PTS *</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.points}
                              onChange={(e) => handleStatChange(playerId, "points", e.target.value)}
                              className={styles.statInputField}
                              required
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>REB</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.rebounds}
                              onChange={(e) => handleStatChange(playerId, "rebounds", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>AST</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.assists}
                              onChange={(e) => handleStatChange(playerId, "assists", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>STL</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.steals}
                              onChange={(e) => handleStatChange(playerId, "steals", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>BLK</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.blocks}
                              onChange={(e) => handleStatChange(playerId, "blocks", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                          <div className={styles.statInput}>
                            <label className={styles.statInputLabel}>TO</label>
                            <input
                              type="number"
                              min="0"
                              value={stats.turnovers}
                              onChange={(e) => handleStatChange(playerId, "turnovers", e.target.value)}
                              className={styles.statInputField}
                              placeholder="-"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading
                ? (isEditMode ? "Updating..." : "Creating...")
                : (isEditMode ? "Update Match" : "Create Match")}
            </button>
            <Link href={isEditMode && match ? `/matches/${match.id}` : "/matches"} className={styles.cancelButton}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

// Alias for backwards compatibility
export function NewMatchContent() {
  return <MatchForm />
}
