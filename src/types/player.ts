// Player types
export interface Player {
  player_id: string;
  player_display_name: string;
  position: string;
  recent_team: string;
  headshot_url?: string;
  season?: number;
}

// Player stats and percentiles
export interface PlayerStats {
  // Allow string keys with values of type string, number, or null
  [key: string]: string | number | null | undefined; 
}

export interface PercentileStats {
  [key: string]: number;
}

// API response types
export interface PlayerSearchResponse {
  player_id: string;
  player_display_name: string;
  recent_team: string;
  position: string;
}

export interface PlayerDataResponse {
  playerInfo: Player;
  seasons: number[];
  stats: PlayerStats | null;
  percentiles: PercentileStats | null;
}

// Stat category types for visualization
export interface StatCategory {
  key: string;
  label: string;
  description: string;
  higherIsBetter: boolean;
}

// Position-specific stat categories
export const QB_STATS: StatCategory[] = [
  { key: 'passing_air_yards', label: 'Attempted Air Yards', description: 'Total air yards on all pass attempts', higherIsBetter: true },
  { key: 'passing_yards', label: 'Passing Yards', description: 'Total passing yards on completions', higherIsBetter: true },
  { key: 'passing_epa', label: 'Passing EPA', description: 'The total expected points added on pass plays', higherIsBetter: true },
  { key: 'comp_pct', label: 'Pass Completion %', description: 'Percentage of pass attempts that are successfully completed', higherIsBetter: true },
  { key: 'sack_rate', label: 'Sack Rate', description: 'Percentage of dropbacks that resulted in a sack', higherIsBetter: false },
  { key: 'rushing_epa', label: 'Rushing EPA', description: 'The total expected points added on rushing plays', higherIsBetter: true },
  { key: 'rushing_yards', label: 'Rushing Yards', description: 'Total rushing yards', higherIsBetter: true },
  { key: 'pacr', label: 'PACR', description: 'Passing Air Yards Conversion Ratio: The ratio of total passing yards to air yards per game', higherIsBetter: true }
];

export const RB_STATS: StatCategory[] = [
  { key: 'rushing_epa', label: 'Rushing EPA', description: 'The total expected points added on rushing plays', higherIsBetter: true },
  { key: 'rushing_yards', label: 'Rushing Yards', description: 'Total rushing yards', higherIsBetter: true },
  { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added on receptions', higherIsBetter: true },
  { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
  { key: 'target_share', label: 'Target Share', description: 'The percentage of targets received in relation to the rest of the team', higherIsBetter: true },
  { key: 'air_yards_share', label: 'Air Yards Share', description: 'The percentage of attempted air yards received in relation to the rest of the team', higherIsBetter: true },
  { key: 'yac%', label: 'YAC %', description: 'The ratio of yards after catch to total receiving yards', higherIsBetter: true },
  { key: 'racr', label: 'RACR', description: 'Receiving Air Yards Conversion Ratio: The ratio of total receiving yards to air yards per game', higherIsBetter: true }
];

export const WR_TE_STATS: StatCategory[] = [
  { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added on receptions', higherIsBetter: true },
  { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
  { key: 'target_share', label: 'Target Share', description: 'The percentage of targets received in relation to the rest of the team', higherIsBetter: true },
  { key: 'air_yards_share', label: 'Air Yards Share', description: 'The percentage of attempted air yards received in relation to the rest of the team', higherIsBetter: true },
  { key: 'yac%', label: 'YAC %', description: 'The ratio of yards after catch to total receiving yards', higherIsBetter: true },
  { key: 'racr', label: 'RACR', description: 'Receiving Air Yards Conversion Ratio: The ratio of total receiving yards to air yards per game', higherIsBetter: true },
  { key: 'wopr', label: 'WOPR', description: 'Weighted Opportunity Rating: Rating of total fantasy usage', higherIsBetter: true }
];

export const DEFAULT_STATS: StatCategory[] = [
  { key: 'games', label: 'Games Played', description: 'Number of games played', higherIsBetter: true },
  { key: 'turnovers', label: 'Turnovers', description: 'Total turnovers (fumbles + interceptions)', higherIsBetter: false },
  { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Total fantasy points scored in PPR leagues', higherIsBetter: true }
];

export function getStatsForPosition(position: string): StatCategory[] {
  switch (position) {
    case 'QB': return QB_STATS;
    case 'RB': return RB_STATS;
    case 'WR': return WR_TE_STATS;
    case 'TE': return WR_TE_STATS;
    default: return DEFAULT_STATS;
  }
}