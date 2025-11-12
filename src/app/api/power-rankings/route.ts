import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDbConnection();
    
    // Query matching the exact SQL from the screenshot
    const query = `
      SELECT team, games_played, win_pct, comp_rpi, rpi_rank 
      FROM rpi_data 
      ORDER BY rpi_rank
    `;

    const rankings = await db.all(query);
    
    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Power rankings fetch error:', error);
    return NextResponse.json({ error: 'An error occurred fetching power rankings' }, { status: 500 });
  }
}

