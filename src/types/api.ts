export interface StatComparisonResponse {
  players: Array<{
    name: string;
    playerId: string;
    value: number;
  }>;
  metadata: {
    position: string;
    season: number;
    statType: string;
    statLabel: string;
  };
} 