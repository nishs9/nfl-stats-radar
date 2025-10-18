import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const full_params = await params;
    const playerId = full_params.playerId;
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get('season');

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    if (!season) {
      return NextResponse.json({ error: 'Season is required' }, { status: 400 });
    }

    const seasonYear = Number(season);
    
    // TODO: remove this check once we support pre-2015 game logs
    // if (seasonYear < 2015) {
    //   return NextResponse.json({ 
    //     error: 'Game logs are not available for seasons before 2015. Support for earlier seasons is coming soon!',
    //     isPreSupported: true
    //   }, { status: 400 });
    // }

    if (seasonYear > 2025) {
      return NextResponse.json({ 
        error: 'Game logs are not available for future seasons',
        isFuture: true
      }, { status: 400 });
    }

    const db = await getDbConnection();

    const columnsToQuery = [
      'week', 'opponent_team', 'completions', 'attempts', 'passing_air_yards', 'passing_yards', 
      'passing_epa', 'passing_tds', 'comp_pct', 'sack_rate', 'rushing_epa', 'rushing_yards', 'receiving_epa', 
      'receiving_yards', 'target_share', 'targets', 'air_yards_share', 'racr', 'wopr', 'total_turnovers', 
      'fantasy_points_ppr', 'receptions', 'receiving_tds', 'receiving_yards_after_catch', 
      'carries', 'rushing_tds', 'yac_pct', 'yards_per_carry', 'yards_per_target', 'passing_interceptions'
    ];

    const gameLogsQuery = `
      SELECT ${columnsToQuery.join(', ')} 
      FROM player_stats_week_${seasonYear} 
      WHERE player_id = ? AND season_type = 'REG'
      ORDER BY week DESC
    `;

    const gameLogs = await db.all(gameLogsQuery, [playerId]);

    if (!gameLogs || gameLogs.length === 0) {
      return NextResponse.json({
        gameLogs: [],
        season: seasonYear,
        message: 'No game logs found for this player in the specified season'
      });
    }

    return NextResponse.json({
      gameLogs,
      season: seasonYear
    });

  } catch (error) {
    console.error('Game logs fetch error:', error);
    return NextResponse.json({ 
      error: 'An error occurred fetching game logs data' 
    }, { status: 500 });
  }
}
