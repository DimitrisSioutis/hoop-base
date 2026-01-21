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

export interface PlayerAverages {
  player_id: string
  player: Player
  games_played: number
  avg_points: number
  avg_rebounds: number
  avg_assists: number
  avg_steals: number
  avg_blocks: number
  avg_turnovers: number
  total_points: number
  total_rebounds: number
  total_assists: number
  total_steals: number
  total_blocks: number
  total_turnovers: number
}
