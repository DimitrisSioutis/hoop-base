export const getInitials = (name: string | null) => {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const formatDateLong = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export const getAvg = (arr: number[]) => {
  if (arr.length === 0) return "0.0"
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
}

/**
 * Player stat for a single match used in PI calculation
 */
interface MatchPlayerStat {
  player_id: string
  match_id: string
  team: 'team_a' | 'team_b'
  points: number
  rebounds: number | null
  assists: number | null
  turnovers: number | null
  steals: number | null
  blocks: number | null
}

/**
 * Calculate Performance Index (PI) for a player in a specific match
 *
 * Formula adapts based on available stats per match:
 * - Points are normalized to winning score (team with most points)
 * - Rebounds, assists add value; turnovers subtract
 * - Weights adjust proportionally based on what stats are tracked
 */
export const calculateMatchPI = (
  playerStat: MatchPlayerStat,
  allMatchStats: MatchPlayerStat[]
): number => {
  // Get all stats for this specific match
  const matchStats = allMatchStats.filter(s => s.match_id === playerStat.match_id)

  // Calculate team totals to find winning score
  const teamAPoints = matchStats
    .filter(s => s.team === 'team_a')
    .reduce((sum, s) => sum + s.points, 0)
  const teamBPoints = matchStats
    .filter(s => s.team === 'team_b')
    .reduce((sum, s) => sum + s.points, 0)

  const winningScore = Math.max(teamAPoints, teamBPoints)

  // Determine which stats are available for this match
  const hasRebounds = matchStats.some(s => s.rebounds !== null)
  const hasAssists = matchStats.some(s => s.assists !== null)
  const hasTurnovers = matchStats.some(s => s.turnovers !== null)
  const hasSteals = matchStats.some(s => s.steals !== null)
  const hasBlocks = matchStats.some(s => s.blocks !== null)

  // Calculate base weights (points always 50 base)
  let totalWeight = 50 // points base weight
  if (hasRebounds) totalWeight += 25
  if (hasAssists) totalWeight += 25
  if (hasSteals) totalWeight += 15
  if (hasBlocks) totalWeight += 15

  // Calculate normalized weights
  const pointsWeight = (50 / totalWeight) * 100
  const reboundsMultiplier = hasRebounds ? (25 / totalWeight) * 6 : 0 // scales to ~1.5 when all stats present
  const assistsMultiplier = hasAssists ? (25 / totalWeight) * 8 : 0 // scales to ~2.0 when all stats present
  const turnoversMultiplier = hasTurnovers ? (25 / totalWeight) * 6 : 0 // penalty scales similarly
  const stealsMultiplier = hasSteals ? (15 / totalWeight) * 7 : 0 // steals are valuable defensive plays
  const blocksMultiplier = hasBlocks ? (15 / totalWeight) * 7 : 0 // blocks are valuable defensive plays

  // Calculate PI
  const pointsContribution = winningScore > 0
    ? (playerStat.points / winningScore) * pointsWeight
    : 0
  const reboundsContribution = (playerStat.rebounds ?? 0) * reboundsMultiplier
  const assistsContribution = (playerStat.assists ?? 0) * assistsMultiplier
  const turnoversContribution = (playerStat.turnovers ?? 0) * turnoversMultiplier
  const stealsContribution = (playerStat.steals ?? 0) * stealsMultiplier
  const blocksContribution = (playerStat.blocks ?? 0) * blocksMultiplier

  return pointsContribution + reboundsContribution + assistsContribution + stealsContribution + blocksContribution - turnoversContribution
}

/**
 * Calculate average PI across all matches for a player
 */
export const calculateAveragePI = (
  playerId: string,
  allStats: MatchPlayerStat[]
): number => {
  const playerStats = allStats.filter(s => s.player_id === playerId)

  if (playerStats.length === 0) return 0

  const totalPI = playerStats.reduce((sum, stat) => {
    return sum + calculateMatchPI(stat, allStats)
  }, 0)

  return totalPI / playerStats.length
}

/**
 * Calculate wins and losses for a player based on their team's performance in each match
 */
export const calculateWinsLosses = (
  playerId: string,
  allStats: MatchPlayerStat[]
): { wins: number; losses: number } => {
  const playerStats = allStats.filter(s => s.player_id === playerId)

  if (playerStats.length === 0) return { wins: 0, losses: 0 }

  // Group all stats by match_id to calculate team totals
  const matchTeamTotals: Record<string, { team_a: number; team_b: number }> = {}
  allStats.forEach((stat) => {
    if (!matchTeamTotals[stat.match_id]) {
      matchTeamTotals[stat.match_id] = { team_a: 0, team_b: 0 }
    }
    matchTeamTotals[stat.match_id][stat.team] += stat.points || 0
  })

  let wins = 0
  let losses = 0

  playerStats.forEach((stat) => {
    const matchTotals = matchTeamTotals[stat.match_id]
    if (matchTotals) {
      const playerTeamScore = matchTotals[stat.team]
      const opponentTeamScore = stat.team === 'team_a' ? matchTotals.team_b : matchTotals.team_a
      if (playerTeamScore > opponentTeamScore) {
        wins++
      } else if (playerTeamScore < opponentTeamScore) {
        losses++
      }
      // Ties are not counted as wins or losses
    }
  })

  return { wins, losses }
}
