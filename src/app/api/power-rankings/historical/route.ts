import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamsParam = searchParams.get('teams');
    
    const db = await getDbConnection();
    
    let query: string;
    let params: any[] = [];
    
    if (teamsParam) {
      const teams = teamsParam.split(',').map(t => t.trim()).filter(t => t);
      if (teams.length === 0) {
        return NextResponse.json({ error: 'No valid teams provided' }, { status: 400 });
      }
      
      const placeholders = teams.map(() => '?').join(',');
      query = `
        SELECT 
          r.team,
          t.team_name,
          t.team_logo_squared,
          r.week,
          r.rpi_rank,
          r.comp_rpi
        FROM historical_rpi_data r
        LEFT JOIN teams t ON r.team = t.team_abbr
        WHERE r.team IN (${placeholders})
        ORDER BY r.week, r.rpi_rank
      `;
      
      params = teams;
    } else {
      query = `
        SELECT 
          r.team,
          t.team_name,
          t.team_logo_squared,
          r.week,
          r.rpi_rank,
          r.comp_rpi
        FROM historical_rpi_data r
        LEFT JOIN teams t ON r.team = t.team_abbr
        ORDER BY r.week, r.rpi_rank
      `;
    }
    
    const results = await db.all(query, params);
    
    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Historical power rankings fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching historical power rankings' }, { status: 500 });
  }
}

