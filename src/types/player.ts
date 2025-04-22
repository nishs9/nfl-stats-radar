// Player types
export interface Player {
  player_id: string;
  player_display_name: string;
  position: string;
  recent_team: string;
  headshot_url?: string;
  season?: number; // Season from playerInfo query (most recent)
}

// Definition for a single statistic category
export interface StatDefinition {
  key: string;       // e.g., 'passing_epa'
  label: string;     // e.g., 'Passing EPA'
  description?: string; // Optional description
  higherIsBetter?: boolean; // Optional: true if higher value is better
}

// Player stats (raw values for a season)
export interface PlayerStats {
  [key: string]: string | number | null | undefined; 
}

// Percentile stats (calculated percentiles for a season)
export interface PercentileStats {
  [key: string]: number; // Key matches StatDefinition.key
}

// API response for player search suggestions
export interface PlayerSearchResponse {
  player_id: string;
  player_display_name: string;
  recent_team: string;
  position: string; // Include position in search results
}

// API response for the main player page data
export interface PlayerDataResponse {
  playerInfo: Player;
  seasons: number[]; // Array of available seasons
  stats: PlayerStats | null; // Stats for the selected season
  percentiles: PercentileStats | null; // Percentiles for the selected season
}

// Helper function (can stay here or move to utils)
// This should return StatDefinition[] now
export function getStatsForPosition(position: string): StatDefinition[] {
  const positionStatsMap: Record<string, StatDefinition[]> = {
    'QB': [
      { key: 'passing_epa', label: 'Passing EPA', description: 'The total expected points added by the QB on pass plays', higherIsBetter: true },
      { key: 'passing_yards', label: 'Passing Yards', description: 'Total passing yards on completions', higherIsBetter: true },
      { key: 'passing_air_yards', label: 'Air Yards', description: 'Total air yards on all passing attempts', higherIsBetter: true },
      { key: 'comp_pct', label: 'Completion %', description: 'Percentage of passes completed', higherIsBetter: true },
      { key: 'sack_rate', label: 'Sack Rate', description: 'Percentage of dropbacks where the QB was sacked', higherIsBetter: false },
      { key: 'rushing_epa', label: 'Rushing EPA', description: 'The total expected points added on rushing plays', higherIsBetter: true },
      { key: 'rushing_yards', label: 'Rushing Yards', description: 'Total rushing yards on carries', higherIsBetter: true },
      { key: 'pacr', label: 'PACR', description: 'Passing Air Conversion Ratio: Passing Yards / Air Yards', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true }
    ],
    'RB': [
      { key: 'rushing_epa', label: 'Rushing EPA', description: 'The total expected points added on rushing plays', higherIsBetter: true },
      { key: 'rushing_yards', label: 'Rushing Yards', description: 'Total rushing yards', higherIsBetter: true },
      { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added by the receiver on pass plays', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', description: 'Percentage share of team targets', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', description: 'Percentage share of team air yards', higherIsBetter: true },
      { key: 'racr', label: 'RACR', description: 'Receiving Air Conversion Ratio: Receiving Yards / Air Yards', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true }
    ],
    'WR': [
      { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added by the receiver on pass plays', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', description: 'Percentage share of team targets', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', description: 'Percentage share of team air yards', higherIsBetter: true },
      { key: 'racr', label: 'RACR', description: 'Receiving Air Conversion Ratio: Receiving Yards / Air Yards', higherIsBetter: true },
      { key: 'wopr', label: 'WOPR', description: 'Weighted Opportunity Rate: Receiving EPA / Receiving Yards', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true }
    ],
    'TE': [
      { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added by the receiver on pass plays', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', description: 'Percentage share of team targets', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', description: 'Percentage share of team air yards', higherIsBetter: true },
      { key: 'racr', label: 'RACR', description: 'Receiving Air Conversion Ratio: Receiving Yards / Air Yards', higherIsBetter: true },
      { key: 'wopr', label: 'WOPR', description: 'Weighted Opportunity Rate: Receiving EPA / Receiving Yards', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true }
    ]
  };

  // Default stats if position not found
  return positionStatsMap[position] || [
    { key: 'games', label: 'Games Played', higherIsBetter: true }
  ];
}