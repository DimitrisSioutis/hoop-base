export interface User {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  player_id: string | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  youtube_url: string | null
  match_date: string
  location: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PlayerStats {
  id: string
  match_id: string
  player_id: string
  team: 'team_a' | 'team_b'
  points: number
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  created_at: string
  updated_at: string
}

export interface PlayerStatsWithPlayer extends PlayerStats {
  players: Player
}

export interface MatchWithStats extends Match {
  player_stats: PlayerStatsWithPlayer[]
}

