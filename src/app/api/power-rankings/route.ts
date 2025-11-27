import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const week = searchParams.get('week');
    
    const db = await getDbConnection();
    
    let query: string;
    
    if (week) {
      const weekNum = Number(week);
      if (isNaN(weekNum) || weekNum < 1) {
        return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
      }
      
      query = `
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
        FROM historical_rpi_data r
        LEFT JOIN teams t ON r.team = t.team_abbr
        WHERE r.week = ?
        ORDER BY r.rpi_rank
      `;
      
      const rankings = await db.all(query, [weekNum]);
      return NextResponse.json({ rankings, week: weekNum });
    } else {
      query = `
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
        FROM historical_rpi_data r
        LEFT JOIN teams t ON r.team = t.team_abbr
        WHERE r.week = (SELECT MAX(week) FROM historical_rpi_data)
        ORDER BY r.rpi_rank
      `;
      
      const rankings = await db.all(query);
      return NextResponse.json({ rankings });
    }
  } catch (error) {
    console.error('Power rankings fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching power rankings' }, { status: 500 });
  }
}

