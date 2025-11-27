import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDbConnection();
    
    const query = `
      SELECT DISTINCT week 
      FROM historical_rpi_data 
      ORDER BY week DESC
    `;
    
    const weeks = await db.all(query);
    const weekNumbers = weeks.map((row: { week: number }) => row.week);
    
    return NextResponse.json({ weeks: weekNumbers });
  } catch (error) {
    console.error('Error fetching available weeks:', error);
    return NextResponse.json({ error: 'An error occurred fetching available weeks' }, { status: 500 });
  }
}

