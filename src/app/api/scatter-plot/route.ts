import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

// List of available stats from player_stats_season_* tables
// Add or remove column names here as needed
const AVAILABLE_STATS = [
  'completions',
  'attempts',
  'passing_air_yards',
  'passing_yards',
  'passing_epa',
  'passing_tds',
  'comp_pct',
  'sack_rate',
  'rushing_epa',
  'rushing_yards',
  'carries',
  'rushing_tds',
  'receiving_epa',
  'receiving_yards',
  'receptions',
  'targets',
  'receiving_tds',
  'receiving_yards_after_catch',
  'target_share',
  'air_yards_share',
  'racr',
  'wopr',
  'total_turnovers',
  'fantasy_points_ppr',
  'yac_pct',
  'yards_per_carry',
  'yards_per_target',
  'passing_interceptions',
  'games',
  // Add more column names here as needed
];

interface ScatterPlotDataPoint {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  xValue: number | null;
  yValue: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get('season');
    const xStat = searchParams.get('xStat');
    const yStat = searchParams.get('yStat');
    const positionsParam = searchParams.get('positions'); // Optional filter by positions (comma-separated)

    if (!season || !xStat || !yStat) {
      return NextResponse.json(
        { error: 'Missing required parameters: season, xStat, and yStat are required' },
        { status: 400 }
      );
    }

    const seasonYear = Number(season);
    if (isNaN(seasonYear) || seasonYear < 1999 || seasonYear > 2025) {
      return NextResponse.json(
        { error: 'Invalid season. Must be between 1999 and 2025' },
        { status: 400 }
      );
    }

    // Validate that the stats are in the available list
    if (!AVAILABLE_STATS.includes(xStat) || !AVAILABLE_STATS.includes(yStat)) {
      return NextResponse.json(
        { error: `Invalid stat. xStat and yStat must be one of: ${AVAILABLE_STATS.join(', ')}` },
        { status: 400 }
      );
    }

    const db = await getDbConnection();
    const tableName = `player_stats_season_${seasonYear}`;

    // Check if table exists
    const tableCheck = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );

    if (!tableCheck) {
      return NextResponse.json(
        { error: `Data not available for season ${seasonYear}` },
        { status: 404 }
      );
    }

    // Parse positions filter
    let selectedPositions: string[] = [];
    if (positionsParam) {
      selectedPositions = positionsParam.split(',').map(p => p.trim()).filter(p => p.length > 0);
      // Validate positions
      const validPositions = ['QB', 'RB', 'WR', 'TE'];
      const invalidPositions = selectedPositions.filter(p => !validPositions.includes(p));
      if (invalidPositions.length > 0) {
        return NextResponse.json(
          { error: `Invalid positions: ${invalidPositions.join(', ')}. Valid positions are: ${validPositions.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Build query with optional position filter
    let query = `
      SELECT 
        player_id,
        player_display_name,
        position,
        recent_team,
        ${xStat} as x_value,
        ${yStat} as y_value
      FROM ${tableName}
      WHERE season_type = 'REG'
        AND ${xStat} IS NOT NULL
        AND ${yStat} IS NOT NULL
        AND position IN ('QB', 'RB', 'WR', 'TE')
    `;

    const queryParams: string[] = [];

    if (selectedPositions.length > 0) {
      const placeholders = selectedPositions.map(() => '?').join(',');
      query += ` AND position IN (${placeholders})`;
      queryParams.push(...selectedPositions);
    }

    query += ` ORDER BY player_display_name`;

    const results = await db.all(query, queryParams);

    interface QueryResult {
      player_id: string;
      player_display_name: string;
      position: string;
      recent_team: string;
      x_value: number | null;
      y_value: number | null;
    }

    const dataPoints: ScatterPlotDataPoint[] = (results as QueryResult[]).map((row) => ({
      playerId: row.player_id,
      playerName: row.player_display_name,
      position: row.position,
      team: row.recent_team,
      xValue: row.x_value,
      yValue: row.y_value,
    }));

    return NextResponse.json({
      dataPoints,
      metadata: {
        season: seasonYear,
        xStat,
        yStat,
        positions: selectedPositions.length > 0 ? selectedPositions : ['all'],
        totalPoints: dataPoints.length,
      },
      availableStats: AVAILABLE_STATS,
    });

  } catch (error) {
    console.error('Error in scatter plot API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

