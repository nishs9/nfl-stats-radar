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
      { key: 'passing_epa', label: 'Passing EPA', higherIsBetter: true },
      { key: 'passing_yards', label: 'Passing Yards', higherIsBetter: true },
      { key: 'passing_air_yards', label: 'Air Yards', higherIsBetter: true },
      { key: 'comp_pct', label: 'Completion %', higherIsBetter: true },
      { key: 'sack_rate', label: 'Sack Rate', higherIsBetter: false },
      { key: 'rushing_epa', label: 'Rushing EPA', higherIsBetter: true },
      { key: 'rushing_yards', label: 'Rushing Yards', higherIsBetter: true },
      { key: 'pacr', label: 'PACR', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', higherIsBetter: true }
    ],
    'RB': [
      { key: 'rushing_epa', label: 'Rushing EPA', higherIsBetter: true },
      { key: 'rushing_yards', label: 'Rushing Yards', higherIsBetter: true },
      { key: 'receiving_epa', label: 'Receiving EPA', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', higherIsBetter: true },
      { key: 'racr', label: 'RACR', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', higherIsBetter: true }
    ],
    'WR': [
      { key: 'receiving_epa', label: 'Receiving EPA', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', higherIsBetter: true },
      { key: 'racr', label: 'RACR', higherIsBetter: true },
      { key: 'wopr', label: 'WOPR', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', higherIsBetter: true }
    ],
    'TE': [
      { key: 'receiving_epa', label: 'Receiving EPA', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', higherIsBetter: true },
      { key: 'racr', label: 'RACR', higherIsBetter: true },
      { key: 'wopr', label: 'WOPR', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', higherIsBetter: true }
    ]
  };

  // Default stats if position not found
  return positionStatsMap[position] || [
    { key: 'games', label: 'Games Played', higherIsBetter: true }
  ];
}