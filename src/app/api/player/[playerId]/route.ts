import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { PlayerStats } from '@/types/player'; // Make sure PlayerStats is imported

// Correct the type definition for the second argument using destructuring
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> } // Destructure params directly
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

    // First get the player's basic info from the most recent season they played
    const playerInfoQuery = `
      WITH PlayerSeasons AS (
        SELECT player_id, player_display_name, position, recent_team, headshot_url, season,
               ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY season DESC) as rn
        FROM (
          SELECT player_id, player_display_name, position, recent_team, headshot_url, 2025 as season FROM player_stats_season_2025 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2024 FROM player_stats_season_2024 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2023 FROM player_stats_season_2023 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2022 FROM player_stats_season_2022 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2021 FROM player_stats_season_2021 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2020 FROM player_stats_season_2020 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2019 FROM player_stats_season_2019 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2018 FROM player_stats_season_2018 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2017 FROM player_stats_season_2017 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2016 FROM player_stats_season_2016 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2015 FROM player_stats_season_2015 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2014 FROM player_stats_season_2014 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2013 FROM player_stats_season_2013 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2012 FROM player_stats_season_2012 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2011 FROM player_stats_season_2011 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2010 FROM player_stats_season_2010 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2009 FROM player_stats_season_2009 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2008 FROM player_stats_season_2008 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2007 FROM player_stats_season_2007 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2006 FROM player_stats_season_2006 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2005 FROM player_stats_season_2005 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2004 FROM player_stats_season_2004 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2003 FROM player_stats_season_2003 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2002 FROM player_stats_season_2002 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2001 FROM player_stats_season_2001 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 2000 FROM player_stats_season_2000 WHERE player_id = ? AND season_type = 'REG'
          UNION ALL SELECT player_id, player_display_name, position, recent_team, headshot_url, 1999 FROM player_stats_season_1999 WHERE player_id = ? AND season_type = 'REG'
        )
      )
      SELECT player_id, player_display_name, position, recent_team, headshot_url, season
      FROM PlayerSeasons
      WHERE rn = 1
    `;

    const queryParams = Array(26).fill(playerId); // Adjusted array size based on query
    const playerInfo = await db.get(playerInfoQuery, queryParams);

    if (!playerInfo) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get all seasons this player has played
    const seasonsQuery = `
      SELECT DISTINCT season
      FROM (
        SELECT 2025 as season FROM player_stats_season_2025 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2024 FROM player_stats_season_2024 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2023 FROM player_stats_season_2023 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2022 FROM player_stats_season_2022 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2021 FROM player_stats_season_2021 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2020 FROM player_stats_season_2020 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2019 FROM player_stats_season_2019 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2018 FROM player_stats_season_2018 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2017 FROM player_stats_season_2017 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2016 FROM player_stats_season_2016 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2015 FROM player_stats_season_2015 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2014 FROM player_stats_season_2014 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2013 FROM player_stats_season_2013 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2012 FROM player_stats_season_2012 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2011 FROM player_stats_season_2011 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2010 FROM player_stats_season_2010 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2009 FROM player_stats_season_2009 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2008 FROM player_stats_season_2008 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2007 FROM player_stats_season_2007 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2006 FROM player_stats_season_2006 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2005 FROM player_stats_season_2005 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2004 FROM player_stats_season_2004 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2003 FROM player_stats_season_2003 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2002 FROM player_stats_season_2002 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2001 FROM player_stats_season_2001 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 2000 FROM player_stats_season_2000 WHERE player_id = ? AND season_type = 'REG'
        UNION ALL SELECT 1999 FROM player_stats_season_1999 WHERE player_id = ? AND season_type = 'REG'
      )
      ORDER BY season DESC
    `;
    
    // Ensure queryParams has the correct length for the seasons query as well
    const seasonsQueryParams = Array(26).fill(playerId); 
    const seasonsResult = await db.all(seasonsQuery, seasonsQueryParams);
    const seasons = seasonsResult.map((s: { season: number }) => s.season); // Extract season numbers

    // Default to the most recent season if not specified
    const targetSeason = season || (seasons.length > 0 ? seasons[0] : null);

    // If no valid season is found, return just the player info
    if (!targetSeason) {
      return NextResponse.json({
        playerInfo,
        seasons: seasons,
        stats: null,
        percentiles: null // Ensure percentiles is also null
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

    return NextResponse.json({
      playerInfo,
      seasons: seasons,
      stats: playerStats,
      percentiles: percentileStats
    });
  } catch (error) {
    console.error('Player fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching player data' }, { status: 500 });
  }
}

// Helper function to define which stats to show for each position
function getStatsForPosition(position: string): string[] {
  // This is a placeholder - you'll need to customize these for each position
  const positionStats: Record<string, string[]> = {
    'QB': ['passing_air_yards', 'passing_yards', 'passing_epa', 'comp_pct', 'sack_rate', 'rushing_epa', 'rushing_yards', 'pacr', 'total_turnovers', 'fantasy_points_ppr'],
    'RB': ['rushing_epa', 'rushing_yards', 'receiving_epa', 'receiving_yards', 'target_share', 'air_yards_share', 'racr', 'wopr', 'total_turnovers', 'fantasy_points_ppr'],
    'WR': ['receiving_epa', 'receiving_yards', 'target_share', 'air_yards_share', 'racr', 'wopr', 'total_turnovers', 'fantasy_points_ppr'],
    'TE': ['receiving_epa', 'receiving_yards', 'target_share', 'air_yards_share', 'racr', 'wopr', 'total_turnovers', 'fantasy_points_ppr']
  };

  return positionStats[position] || ['games', 'offensive_snaps', 'defensive_snaps'];
}

// Helper function to calculate percentiles
async function calculatePercentiles(
  db: unknown, // Use unknown instead of any
  playerStats: PlayerStats, // Use the defined PlayerStats type
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