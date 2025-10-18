import sqlite3
import pandas as pd
from pathlib import Path

def generate_derived_column_stats(df, year, is_week_data=False):
    df['comp_pct'] = (df['completions'] / df['attempts']) * 100
    # is_week_data is a hacky workaround due to some inconsistencies in schema between seasons
    if year <= 2024 and not is_week_data:
        df['sack_rate'] = (df['sacks'] / (df['sacks'] + df['attempts'])) * 100
        df['total_turnovers'] = df['interceptions'] + df['rushing_fumbles_lost'] + df['receiving_fumbles_lost']
    else:
        df['sack_rate'] = (df['sacks_suffered'] / (df['sacks_suffered'] + df['attempts'])) * 100
        df['total_turnovers'] = df['passing_interceptions'] + df['rushing_fumbles_lost'] + df['receiving_fumbles_lost']
    df['yac_pct'] = df['receiving_yards_after_catch'] / df['receiving_yards'] * 100
    df['passing_adot'] = df['passing_air_yards'] / df['attempts']
    df['receiving_adot'] = df['receiving_air_yards'] / df['targets']
    df['yards_per_carry'] = df['rushing_yards'] / df['carries']
    df['yards_per_target'] = df['receiving_yards'] / df['targets']
    if year >= 2025:
        df['interceptions'] = df['passing_interceptions']
    return df

def get_player_stats_season_data():
    player_stats_data_df_list = {}
    for year in range(1999, 2026):
        print(f"Downloading player season stats for {year}")
        base_url_std = f'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_season_{year}.csv.gz'
        if year == 2025:
            base_url_std = f'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_regpost_{year}.csv.gz'
        raw_player_stats_data = pd.read_csv(base_url_std, compression='gzip', low_memory=False)
        player_stats_data_df_list[year] = raw_player_stats_data
    return player_stats_data_df_list

def get_player_stats_week_data():
    player_stats_data_df_list = {}
    for year in range(2015, 2026):
        print(f"Downloading player weekly stats for {year}")
        base_url_std = f'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_{year}.csv.gz'
        raw_player_stats_data = pd.read_csv(base_url_std, compression='gzip', low_memory=False)
        player_stats_data_df_list[year] = raw_player_stats_data
    return player_stats_data_df_list

def create_database_online(conn: sqlite3.Connection):
    cursor = conn.cursor()
    player_stats_season_data_df_list = get_player_stats_season_data()
    for year, df in player_stats_season_data_df_list.items():
        table_name = f'player_stats_season_{year}'
        df = generate_derived_column_stats(df, year)
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_player_season ON {table_name}(player_id, season, recent_team)")
        print(f"Created table {table_name} with {len(df)} rows")

    player_stats_week_data_df_list = get_player_stats_week_data()
    for year, df in player_stats_week_data_df_list.items():
        table_name = f'player_stats_week_{year}'
        df = generate_derived_column_stats(df, year, is_week_data=True)
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_player_week ON {table_name}(player_id, season, week, team)")
        print(f"Created table {table_name} with {len(df)} rows")

    print("Online database setup complete!")

def create_database(conn: sqlite3.Connection):
    cursor = conn.cursor()

    csv_dir = Path('player_stats_season')
    csv_files = list(csv_dir.glob('player_stats_season_*.csv'))

    for csv_file in csv_files:
        df = pd.read_csv(csv_file)
        
        table_name = csv_file.stem
        year = int(table_name.replace("player_stats_season_", "").replace(".csv", ""))

        # Generate additional derived columns
        final_df = generate_derived_column_stats(df, year)

        # Generate basic db indexes
        cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_player_season ON {table_name}(player_id, season)")
        
        final_df.to_sql(table_name, conn, if_exists='replace', index=False)
        print(f"Created table {table_name} with {len(final_df)} rows")
    
    print("Database setup complete!")

if __name__ == "__main__":
    conn = sqlite3.connect('nfl_stats.db')
    create_database_online(conn)
    conn.commit()
    conn.close() 