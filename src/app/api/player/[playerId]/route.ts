import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { PlayerStats } from '@/types/player';

// Correct the type definition for the second argument using destructuring
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    // Access playerId directly via the destructured params
    const full_params = await params;
    const playerId = full_params.playerId; 
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get('season');

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const db = await getDbConnection();

    const years = Array.from({ length: 2025 - 1999 + 1 }, (_, i) => 2025 - i);

    const playerInfoUnionQueries = years
      .map(
        (year) =>
          `SELECT player_id, player_display_name, position, recent_team, headshot_url, ${year} as season 
            FROM player_stats_season_${year} WHERE player_id = ? AND season_type = 'REG'`
      )
      .join('\nUNION ALL ');
    const playerInfoQuery = `
      SELECT player_id, player_display_name, position, recent_team, headshot_url, season,
              ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY season DESC) as rn 
        FROM (${playerInfoUnionQueries}) ORDER BY season DESC`;

    const queryParams = Array(years.length).fill(playerId);
    const playerInfo = await db.get(playerInfoQuery, queryParams);

    if (!playerInfo) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const seasonsUnionQueries = years
      .map(
        (year) =>
          `SELECT ${year} as season FROM player_stats_season_${year} WHERE player_id = ? AND season_type = 'REG'`
      )
      .join('\nUNION ALL ');
    const seasonsQuery = `
      SELECT DISTINCT season FROM (${seasonsUnionQueries}) ORDER BY season DESC`;
    
    // Ensure queryParams has the correct length for the seasons query as well
    const seasonsQueryParams = Array(years.length).fill(playerId); 
    const seasonsResult = await db.all(seasonsQuery, seasonsQueryParams);
    const seasons = seasonsResult.map((s: { season: number }) => s.season);

    // Default to the most recent season if not specified
    const targetSeason = season || (seasons.length > 0 ? seasons[0] : null);

    // If no valid season is found, return just the player info
    if (!targetSeason) {
      return NextResponse.json({
        playerInfo,
        seasons: seasons,
        stats: null,
        percentiles: null
      });
    }

    // Get player stats for the specified season
    const statsQuery = `SELECT * FROM player_stats_season_${targetSeason} WHERE player_id = ? AND season_type = 'REG'`;
    const playerStats = await db.get(statsQuery, [playerId]);

    // If player stats for that season exist, calculate percentiles
    let percentileStats = null;
    if (playerStats) {
      const position = playerInfo.position;
      
      // Define which stats to calculate percentiles for based on position
      const statsToCalculate = getStatsForPosition(position);
      
      if (statsToCalculate.length > 0) {
        percentileStats = await calculatePercentiles(db, playerStats, position, Number(targetSeason), statsToCalculate);
      }
    }

    const columnsToQuery = ['season', 'recent_team', 'games', 'completions', 'attempts', 'passing_air_yards', 'passing_yards', 
      'passing_epa', 'passing_tds', 'comp_pct', 'sack_rate', 'rushing_epa', 'rushing_yards', 'receiving_epa', 'receiving_yards', 'target_share', 
      'air_yards_share', 'racr', 'wopr', 'total_turnovers', 'fantasy_points_ppr', 'receptions', 'receiving_tds', 'receiving_yards_after_catch', 
      'carries', 'rushing_tds', 'yac_pct'];

    // Get career stats for all seasons
    const careerStatsUnionQueries = years
      .map(
        (year) =>
          `SELECT ${columnsToQuery.join(', ')} FROM player_stats_season_${year} WHERE player_id = ? AND season_type = 'REG'`
      )
      .join('\nUNION ALL ');
    const careerStatsQuery = `
      SELECT ${columnsToQuery.join(', ')} FROM (${careerStatsUnionQueries}) ORDER BY season DESC`;

    const careerStatsQueryParams = Array(years.length).fill(playerId);
    const careerStats = await db.all(careerStatsQuery, careerStatsQueryParams);

    return NextResponse.json({
      playerInfo,
      seasons: seasons,
      stats: playerStats,
      percentiles: percentileStats,
      careerStats: careerStats
    });
  } catch (error) {
    console.error('Player fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching player data' }, { status: 500 });
  }
}

// Helper function to define which stats to show for each position
function getStatsForPosition(position: string): string[] {
  const positionStats: Record<string, string[]> = {
    'QB': ['passing_air_yards', 'passing_yards', 'passing_adot', 'passing_epa', 'comp_pct', 'sack_rate', 'rushing_epa', 'rushing_yards', 'pacr', 'total_turnovers', 'fantasy_points_ppr'],
    'RB': ['rushing_epa', 'rushing_yards', 'receiving_epa', 'receiving_yards', 'target_share', 'air_yards_share', 'racr', 'wopr', 'total_turnovers', 'fantasy_points_ppr', 'yac_pct', 'receiving_adot'],
    'WR': ['receiving_epa', 'receiving_yards', 'target_share', 'air_yards_share', 'racr', 'wopr', 'total_turnovers', 'fantasy_points_ppr', 'yac_pct', 'receiving_adot'],
    'TE': ['receiving_epa', 'receiving_yards', 'target_share', 'air_yards_share', 'racr', 'wopr', 'total_turnovers', 'fantasy_points_ppr', 'yac_pct', 'receiving_adot']
  };

  return positionStats[position] || ['games', 'offensive_snaps', 'defensive_snaps'];
}

// Helper function to calculate percentiles
async function calculatePercentiles(
  db: unknown,
  playerStats: PlayerStats,
  position: string, 
  season: number, 
  statsToCalculate: string[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  
  // Cast db to the expected type when using it
  const dbConnection = db as import('sqlite').Database; 

  for (const stat of statsToCalculate) {
    if (playerStats[stat] === undefined) continue;
    
    const percentileQuery = `
      SELECT
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM player_stats_season_${season} WHERE position = ? AND ${stat} IS NOT NULL AND season_type = 'REG'))
        AS percentile
      FROM player_stats_season_${season}
      WHERE position = ? AND ${stat} IS NOT NULL AND ${stat} < ? AND season_type = 'REG'
    `;
    
    // Use dbConnection instead of db for database operations
    const percentileResult = await dbConnection.get(percentileQuery, [position, position, playerStats[stat]]);
    
    if (percentileResult) {
      result[stat] = Math.round(percentileResult.percentile);
    }
  }
  
  return result;
}