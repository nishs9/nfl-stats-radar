import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDbConnection();
    
    // Join rpi_data with teams table to get full team names and logos
    const query = `
      SELECT 
        r.team,
        t.team_name,
        t.team_logo_squared,
        r.games_played,
        r.wins,
        r.losses,
        r.win_pct,
        round(r.comp_rpi * 100, 3) as comp_rpi,
        r.rpi_rank
      FROM rpi_data r
      LEFT JOIN teams t ON r.team = t.team_abbr
      ORDER BY r.rpi_rank
    `;

    const rankings = await db.all(query);
    
    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Power rankings fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching power rankings' }, { status: 500 });
  }
}

