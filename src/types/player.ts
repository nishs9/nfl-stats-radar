// Player types
export interface Player {
  player_id: string;
  player_display_name: string;
  position: string;
  recent_team: string;
  headshot_url?: string;
  season?: number;
}

// Definition for a single statistic category
export interface StatDefinition {
  key: string;
  label: string;
  description?: string;
  higherIsBetter?: boolean;
}

// Player stats (raw values for a season)
export interface PlayerStats {
  [key: string]: string | number | null | undefined; 
}

// Percentile stats (calculated percentiles for a season)
export interface PercentileStats {
  [key: string]: number; 
}

// Used for stats table on the player profile page
export interface CareerStats {
  season: number;
  recent_team: string;
  completions?: number | null;
  attempts?: number | null;
  passing_yards?: number | null;
  passing_air_yards?: number | null;
  passing_epa?: number | null;
  passing_tds?: number | null;
  comp_pct?: number | null;
  sack_rate?: number | null;
  carries?: number | null;
  rushing_epa?: number | null;
  rushing_yards?: number | null;
  rushing_tds?: number | null;
  receptions?: number | null;
  targets?: number | null;
  receiving_epa?: number | null;
  receiving_yards?: number | null;
  receiving_tds?: number | null;
  receiving_yards_after_catch?: number | null;
  target_share?: number | null;
  air_yards_share?: number | null;
  racr?: number | null;
  wopr?: number | null;
  total_turnovers?: number | null;
  fantasy_points_ppr?: number | null;
  games?: number | null;
  yac_pct?: number | null;
}

// Used for game logs table - similar to CareerStats but with week and opponent
export interface GameLogStats {
  week: number;
  opponent_team: string;
  completions?: number | null;
  attempts?: number | null;
  passing_yards?: number | null;
  passing_air_yards?: number | null;
  passing_epa?: number | null;
  passing_tds?: number | null;
  comp_pct?: number | null;
  sack_rate?: number | null;
  carries?: number | null;
  rushing_epa?: number | null;
  rushing_yards?: number | null;
  rushing_tds?: number | null;
  receptions?: number | null;
  receiving_epa?: number | null;
  receiving_yards?: number | null;
  receiving_tds?: number | null;
  receiving_yards_after_catch?: number | null;
  targets?: number | null;
  target_share?: number | null;
  air_yards_share?: number | null;
  racr?: number | null;
  wopr?: number | null;
  total_turnovers?: number | null;
  fantasy_points_ppr?: number | null;
  yac_pct?: number | null;
  yards_per_carry?: number | null;
  yards_per_target?: number | null;
  interceptions?: number | null;
}

// API response for player search suggestions
export interface PlayerSearchResponse {
  player_id: string;
  player_display_name: string;
  recent_team: string;
  position: string; 
}

// API response for the main player page data
export interface PlayerDataResponse {
  playerInfo: Player;
  seasons: number[];
  stats: PlayerStats | null; 
  percentiles: PercentileStats | null; 
  careerStats: CareerStats[]; 
}

// API response for game logs data
export interface GameLogsResponse {
  gameLogs: GameLogStats[];
  season: number;
  message?: string;
}

// Power Rankings / RPI types
export interface RPIRanking {
  team: string;
  team_name: string;
  team_logo_squared: string;
  games_played: number;
  wins: number;
  losses: number;
  win_pct: number;
  comp_rpi: number;
  rpi_rank: number;
}

export interface PowerRankingsResponse {
  rankings: RPIRanking[];
}

// Pass Map types
export interface PassMapCellStats {
  completions: number;
  attempts: number;
  completionPct: number | null;
  airYards: number;
  passingYards: number;
  passingAirEpa: number;
  airEpaPerPlay: number | null;
  totalPassingEpa: number;
  totalPassingEpaPerPlay: number | null;
  touchdowns: number;
  interceptions: number;
}

export interface PassMapData {
  // key format: "{distance}_{location}"
  [key: string]: PassMapCellStats;
}

export interface PassMapResponse {
  passMapData: PassMapData;
  season: number;
  totalPlays?: number;
  message?: string;
}

export type PassDistance = 'short' | 'medium' | 'medium_long' | 'long';
export type PassLocation = 'left' | 'middle' | 'right';

export interface PassMapStatOption {
  key: keyof PassMapCellStats;
  label: string;
  format?: 'number' | 'percentage' | 'decimal';
}

// Helper function (can stay here or move to utils)
// This should return StatDefinition[] now
export function getStatsForPosition(position: string): StatDefinition[] {
  const positionStatsMap: Record<string, StatDefinition[]> = {
    'QB': [
      { key: 'passing_epa', label: 'Passing EPA', description: 'The total expected points added by the QB on pass plays', higherIsBetter: true },
      { key: 'rushing_epa', label: 'Rushing EPA', description: 'The total expected points added on rushing plays', higherIsBetter: true },
      { key: 'passing_yards', label: 'Passing Yards', description: 'Total passing yards on completions', higherIsBetter: true },
      { key: 'rushing_yards', label: 'Rushing Yards', description: 'Total rushing yards on carries', higherIsBetter: true },
      { key: 'comp_pct', label: 'Completion %', description: 'Percentage of passes completed', higherIsBetter: true },
      { key: 'pacr', label: 'PACR', description: 'Passing Air Conversion Ratio: Passing Yards / Air Yards', higherIsBetter: true },
      { key: 'passing_air_yards', label: 'Air Yards', description: 'Total air yards on all passing attempts', higherIsBetter: true },
      { key: 'passing_adot', label: 'ADOT', description: 'Average Depth of Target: Passing Air Yards / Attempts', higherIsBetter: true },
      { key: 'sack_rate', label: 'Sack Rate', description: 'Percentage of dropbacks where the QB was sacked', higherIsBetter: false },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true }
    ],
    'RB': [
      { key: 'rushing_epa', label: 'Rushing EPA', description: 'The total expected points added on rushing plays', higherIsBetter: true },
      { key: 'rushing_yards', label: 'Rushing Yards', description: 'Total rushing yards', higherIsBetter: true },
      { key: 'carries', label: 'Carries', description: 'Total number of rushing attempts', higherIsBetter: true },
      { key: 'yards_per_carry', label: 'Yards Per Carry', description: 'Average rushing yards per rushing attempt', higherIsBetter: true },
      { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added by the receiver on pass plays', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', description: 'Percentage share of team targets', higherIsBetter: true },
      { key: 'wopr', label: 'WOPR', description: 'Weighted Opportunity Rate: 1.5 * Target Share + 0.7 * Air Yard Share', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true }
    ],
    'WR': [
      { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added by the receiver on pass plays', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', description: 'Percentage share of team targets', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', description: 'Percentage share of team air yards', higherIsBetter: true },
      { key: 'racr', label: 'RACR', description: 'Receiving Air Conversion Ratio: Receiving Yards / Air Yards', higherIsBetter: true },
      { key: 'wopr', label: 'WOPR', description: 'Weighted Opportunity Rate: 1.5 * Target Share + 0.7 * Air Yard Share', higherIsBetter: true },
      { key: 'yac_pct', label: 'YAC %', description: 'Percentage of total receiving yards that came after the catch', higherIsBetter: true },
      { key: 'receiving_adot', label: 'ADOT', description: 'Average Depth of Target: Receiving Air Yards / Targets', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true },
    ],
    'TE': [
      { key: 'receiving_epa', label: 'Receiving EPA', description: 'The total expected points added by the receiver on pass plays', higherIsBetter: true },
      { key: 'receiving_yards', label: 'Receiving Yards', description: 'Total receiving yards', higherIsBetter: true },
      { key: 'target_share', label: 'Target Share', description: 'Percentage share of team targets', higherIsBetter: true },
      { key: 'air_yards_share', label: 'Air Yards Share', description: 'Percentage share of team air yards', higherIsBetter: true },
      { key: 'racr', label: 'RACR', description: 'Receiving Air Conversion Ratio: Receiving Yards / Air Yards', higherIsBetter: true },
      { key: 'wopr', label: 'WOPR', description: 'Weighted Opportunity Rate: 1.5 * Target Share + 0.7 * Air Yard Share', higherIsBetter: true },
      { key: 'yac_pct', label: 'YAC %', description: 'Percentage of total receiving yards that came after the catch', higherIsBetter: true },
      { key: 'receiving_adot', label: 'ADOT', description: 'Average Depth of Target: Receiving Air Yards / Targets', higherIsBetter: true },
      { key: 'total_turnovers', label: 'Total Turnovers', description: 'Total turnovers', higherIsBetter: false },
      { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', description: 'Fantasy points per game in PPR scoring', higherIsBetter: true },
    ]
  };

  // Default stats if position not found
  return positionStatsMap[position] || [
    { key: 'games', label: 'Games Played', higherIsBetter: true }
  ];
}