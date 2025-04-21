import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const db = await getDbConnection();
    
    // Query to find players across all seasons, prioritizing most recent appearances
    const searchQuery = `
      WITH RankedPlayers AS (
        SELECT player_id, player_display_name, recent_team, season,
               ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY season DESC) as rn
        FROM (
          SELECT player_id, player_display_name, recent_team, 2023 as season FROM player_stats_season_2023
          UNION ALL SELECT player_id, player_display_name, recent_team, 2022 FROM player_stats_season_2022
          UNION ALL SELECT player_id, player_display_name, recent_team, 2021 FROM player_stats_season_2021
          UNION ALL SELECT player_id, player_display_name, recent_team, 2020 FROM player_stats_season_2020
          UNION ALL SELECT player_id, player_display_name, recent_team, 2019 FROM player_stats_season_2019
          UNION ALL SELECT player_id, player_display_name, recent_team, 2018 FROM player_stats_season_2018
          UNION ALL SELECT player_id, player_display_name, recent_team, 2017 FROM player_stats_season_2017
          UNION ALL SELECT player_id, player_display_name, recent_team, 2016 FROM player_stats_season_2016
          UNION ALL SELECT player_id, player_display_name, recent_team, 2015 FROM player_stats_season_2015
          UNION ALL SELECT player_id, player_display_name, recent_team, 2014 FROM player_stats_season_2014
          UNION ALL SELECT player_id, player_display_name, recent_team, 2013 FROM player_stats_season_2013
          UNION ALL SELECT player_id, player_display_name, recent_team, 2012 FROM player_stats_season_2012
          UNION ALL SELECT player_id, player_display_name, recent_team, 2011 FROM player_stats_season_2011
          UNION ALL SELECT player_id, player_display_name, recent_team, 2010 FROM player_stats_season_2010
          UNION ALL SELECT player_id, player_display_name, recent_team, 2009 FROM player_stats_season_2009
          UNION ALL SELECT player_id, player_display_name, recent_team, 2008 FROM player_stats_season_2008
          UNION ALL SELECT player_id, player_display_name, recent_team, 2007 FROM player_stats_season_2007
          UNION ALL SELECT player_id, player_display_name, recent_team, 2006 FROM player_stats_season_2006
          UNION ALL SELECT player_id, player_display_name, recent_team, 2005 FROM player_stats_season_2005
          UNION ALL SELECT player_id, player_display_name, recent_team, 2004 FROM player_stats_season_2004
          UNION ALL SELECT player_id, player_display_name, recent_team, 2003 FROM player_stats_season_2003
          UNION ALL SELECT player_id, player_display_name, recent_team, 2002 FROM player_stats_season_2002
          UNION ALL SELECT player_id, player_display_name, recent_team, 2001 FROM player_stats_season_2001
          UNION ALL SELECT player_id, player_display_name, recent_team, 2000 FROM player_stats_season_2000
          UNION ALL SELECT player_id, player_display_name, recent_team, 1999 FROM player_stats_season_1999
        )
      )
      SELECT player_id, player_display_name, recent_team
      FROM RankedPlayers
      WHERE rn = 1 AND player_display_name LIKE ?
      ORDER BY player_display_name
      LIMIT 10;
    `;

    const players = await db.all(searchQuery, [`%${query}%`]);
    
    return NextResponse.json(players);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'An error occurred during search' }, { status: 500 });
  }
}