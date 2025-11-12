import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

interface CellStats {
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

interface PassMapData {
  // key format: "{distance}_{location}"
  [key: string]: CellStats;
}

interface AggregatedRow {
  distance_category: string;
  location_category: string;
  completions: number;
  attempts: number;
  air_yards: number;
  passing_yards: number;
  passing_air_epa: number;
  total_passing_epa: number;
  touchdowns: number;
  interceptions: number;
}

function initializePassMapData(): PassMapData {
  const data: PassMapData = {};
  
  const distances = ['short', 'medium', 'medium_long', 'long'];
  const locations = ['left', 'middle', 'right'];
  
  for (const distance of distances) {
    for (const location of locations) {
      const key = `${distance}_${location}`;
      data[key] = {
        completions: 0,
        attempts: 0,
        completionPct: null,
        airYards: 0,
        passingYards: 0,
        passingAirEpa: 0,
        airEpaPerPlay: null,
        totalPassingEpa: 0,
        totalPassingEpaPerPlay: null,
        touchdowns: 0,
        interceptions: 0
      };
    }
  }
  
  return data;
}

function processAggregatedData(rows: AggregatedRow[]): PassMapData {
  const passMapData = initializePassMapData();
  
  for (const row of rows) {
    const key = `${row.distance_category}_${row.location_category}`;
    
    if (passMapData[key]) {
      passMapData[key] = {
        completions: row.completions || 0,
        attempts: row.attempts || 0,
        completionPct: row.attempts > 0 
          ? Math.round((row.completions / row.attempts) * 1000) / 10 
          : null,
        airYards: row.air_yards || 0,
        passingYards: row.passing_yards || 0,
        passingAirEpa: row.passing_air_epa || 0,
        airEpaPerPlay: row.attempts > 0 
          ? row.passing_air_epa / row.attempts 
          : null,
        totalPassingEpa: row.total_passing_epa || 0,
        totalPassingEpaPerPlay: row.attempts > 0 
          ? row.total_passing_epa / row.attempts 
          : null,
        touchdowns: row.touchdowns || 0,
        interceptions: row.interceptions || 0
      };
    }
  }
  
  return passMapData;
}

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

    // Validate season is 2010 or later
    if (seasonYear < 2010) {
      return NextResponse.json({ 
        error: 'Pass map data is only available from 2010 onwards',
        isPre2010: true
      }, { status: 400 });
    }

    if (seasonYear > 2025) {
      return NextResponse.json({ 
        error: 'Pass map data is not available for future seasons',
        isFuture: true
      }, { status: 400 });
    }

    const db = await getDbConnection();

    // Verify table exists for the season
    try {
      const tableCheckQuery = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `;
      const tableExists = await db.get(tableCheckQuery, [`play_by_play_${seasonYear}`]);
      
      if (!tableExists) {
        return NextResponse.json({
          error: `Play-by-play data not available for ${seasonYear}`,
          isDataUnavailable: true
        }, { status: 404 });
      }
    } catch (tableCheckError) {
      console.error('Table check error:', tableCheckError);
      return NextResponse.json({
        error: 'Error checking data availability',
        isDataUnavailable: true
      }, { status: 500 });
    }

    // Query with aggregations done in SQL
    const query = `
      SELECT 
        CASE 
          WHEN air_yards <= 5 THEN 'short'
          WHEN air_yards <= 10 THEN 'medium'
          WHEN air_yards <= 15 THEN 'medium_long'
          ELSE 'long'
        END as distance_category,
        LOWER(pass_location) as location_category,
        SUM(CASE WHEN complete_pass = 1 THEN 1 ELSE 0 END) as completions,
        COUNT(CASE WHEN pass_attempt = 1 AND sack = 0 THEN 1 END) as attempts,
        SUM(CASE WHEN pass_attempt = 1 AND sack = 0 THEN COALESCE(air_yards, 0) ELSE 0 END) as air_yards,
        SUM(CASE WHEN pass_attempt = 1 AND sack = 0 THEN COALESCE(yards_gained, 0) ELSE 0 END) as passing_yards,
        SUM(CASE WHEN pass_attempt = 1 AND sack = 0 THEN COALESCE(air_epa, 0) ELSE 0 END) as passing_air_epa,
        SUM(CASE WHEN pass_attempt = 1 AND sack = 0 THEN COALESCE(qb_epa, 0) ELSE 0 END) as total_passing_epa,
        SUM(CASE WHEN pass_touchdown = 1 THEN 1 ELSE 0 END) as touchdowns,
        SUM(CASE WHEN interception = 1 THEN 1 ELSE 0 END) as interceptions
      FROM play_by_play_${seasonYear}
      WHERE play_type = 'pass'
        AND passer_player_id = ?
        AND season_type = 'REG'
        AND pass_location IS NOT NULL
        AND air_yards IS NOT NULL
      GROUP BY distance_category, location_category
    `;

    let aggregatedRows: AggregatedRow[];
    
    try {
      aggregatedRows = await db.all(query, [playerId]) as AggregatedRow[];
    } catch (queryError) {
      console.error('Query error:', queryError);
      return NextResponse.json({
        error: 'Error querying play-by-play data',
        isQueryError: true
      }, { status: 500 });
    }

    // Process the aggregated data
    const passMapData = processAggregatedData(aggregatedRows);
    
    // Calculate total plays for info
    const totalPlays = aggregatedRows.reduce((sum, row) => sum + row.attempts, 0);

    return NextResponse.json({
      passMapData,
      season: seasonYear,
      totalPlays
    });

  } catch (error) {
    console.error('Pass map fetch error:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'An error occurred fetching pass map data';
    
    return NextResponse.json({ 
      error: errorMessage,
      isServerError: true
    }, { status: 500 });
  }
}

