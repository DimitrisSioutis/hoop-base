"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Player } from "@/lib/types"
import { PlayerAvatar, SuccessIcon, ErrorIcon, EditIcon, TrashIcon } from "@/components/shared"
import styles from "./manage-players-content.module.scss"

export function ManagePlayersContent() {
  const [players, setPlayers] = useState<Player[]>([])
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlayer, setNewPlayer] = useState({ name: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.from("players").select("*").order("name", { ascending: true })

    if (data) {
      setPlayers(data)
    }
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer({ ...player })
    setIsCreating(false)
    setError(null)
    setSuccess(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingPlayer) return
    const { name, value } = e.target

    setEditingPlayer((prev) => {
      if (!prev) return prev

      if (name === "jersey_number") {
        return { ...prev, [name]: value ? Number.parseInt(value) : null }
      }
      return { ...prev, [name]: value || null }
    })
  }

  const handleNewPlayerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewPlayer((prev) => ({ ...prev, [name]: value }))
  }

  const handleSavePlayer = async () => {
    if (!editingPlayer) return
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: updateError } = await supabase
        .from("players")
        .update({
          name: editingPlayer.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPlayer.id)

      if (updateError) throw updateError

      setSuccess(`${editingPlayer.name} updated successfully!`)
      setEditingPlayer(null)
      fetchPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update player")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlayer = async () => {
    if (!newPlayer.name) {
      setError("Player name is required")
      return
    }
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: insertError } = await supabase.from("players").insert({
        name: newPlayer.name
      })

      if (insertError) throw insertError

      setSuccess(`${newPlayer.name} created successfully!`)
      setNewPlayer({ name: "" })
      setIsCreating(false)
      fetchPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create player")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlayer = async (player: Player) => {
    if (!confirm(`Are you sure you want to delete ${player.name}? This will also delete all their stats.`)) {
      return
    }

    try {
      const supabase = getSupabaseBrowserClient()
      const { error: deleteError } = await supabase.from("players").delete().eq("id", player.id)

      if (deleteError) throw deleteError

      setSuccess(`${player.name} deleted successfully!`)
      fetchPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete player")
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Players</h1>
          <p className={styles.subtitle}>Create and edit basketball players</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setEditingPlayer(null); setError(null); setSuccess(null); }}
          className={styles.addButton}
        >
          + Add Player
        </button>
      </header>

      {success && (
        <div className={styles.successMessage}>
          <SuccessIcon />
          {success}
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <ErrorIcon />
          {error}
        </div>
      )}

      {isCreating && (
        <div className={styles.playerCard}>
          <div className={styles.editForm}>
            <h3 style={{ marginBottom: '1rem' }}>Create New Player</h3>
            <div className={styles.editFields}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newPlayer.name}
                  onChange={handleNewPlayerChange}
                  className={styles.formInput}
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            <div className={styles.editActions}>
              <button onClick={handleCreatePlayer} className={styles.submitButton} disabled={loading}>
                {loading ? "Creating..." : "Create Player"}
              </button>
              <button onClick={() => setIsCreating(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.playerList}>
        {players.map((player) => (
          <div
            key={player.id}
            className={`${styles.playerCard} ${editingPlayer?.id === player.id ? styles.editing : ""}`}
          >
            {editingPlayer?.id === player.id ? (
              <div className={styles.editForm}>
                <div className={styles.editHeader}>
                  <PlayerAvatar
                    avatarUrl={player.avatar_url}
                    name={player.name}
                    size="xl"
                  />
                  <div className={styles.editTitle}>
                    <span className={styles.fullName}>{player.name || "Unknown"}</span>
                  </div>
                </div>

                <div className={styles.editFields}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editingPlayer.name || ""}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="Full name"
                    />
                  </div>
                </div>

                <div className={styles.editActions}>
                  <button onClick={handleSavePlayer} className={styles.submitButton} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditingPlayer(null)} className={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.playerDisplay}>
                <div className={styles.playerInfo}>
                  <PlayerAvatar
                    avatarUrl={player.avatar_url}
                    name={player.name}
                    size="xl"
                  />
                  <div className={styles.playerDetails}>
                    <div className={styles.nameRow}>
                      <span className={styles.playerName}>{player.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleEditPlayer(player)} className={styles.editButton}>
                    <EditIcon />
                    Edit
                  </button>
                  <button onClick={() => handleDeletePlayer(player)} className={styles.deleteButton}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
