import { NextResponse } from 'next/server';
import type { StatComparisonResponse } from '@/types/api';
import { getDbConnection } from '@/lib/db';
import { getStatsForPosition } from '@/types/player';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const season = parseInt(searchParams.get('season') || '');
    const statType = searchParams.get('statType');

    if (!position || !season || !statType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const db = await getDbConnection();
    const tableName = `player_stats_season_${season}`;

    // Validate that the stat type exists in the table
    const tableInfo = await db.all(`PRAGMA table_info(${tableName})`);
    const validColumns = tableInfo.map(col => col.name);
    
    if (!validColumns.includes(statType)) {
      return NextResponse.json(
        { error: 'Invalid stat type' },
        { status: 400 }
      );
    }

    // Get the stat definition to find its label
    const statDefinitions = getStatsForPosition(position);
    const statDef = statDefinitions.find(def => def.key === statType);
    const statLabel = statDef?.label || statType; // Fallback to key if label not found

    // Query to get players and their stats for the given position and season
    const query = `
      SELECT 
        player_id,
        player_display_name,
        ${statType}
      FROM ${tableName}
      WHERE position = ? 
        AND ${statType} IS NOT NULL
        AND season_type = 'REG'
      ORDER BY ${statType} DESC
    `;

    const players = await db.all(query, [position]);

    return NextResponse.json(
      {
        players: players.map(player => ({
          playerId: player.player_id,
          name: player.player_display_name,
          value: player[statType],
        })),
        metadata: {
          position,
          season,
          statType,
          statLabel,
        },
      } as StatComparisonResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in stats comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 