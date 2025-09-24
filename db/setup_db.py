import os
import sqlite3
import pandas as pd
from pathlib import Path

def generate_derived_column_stats(df, year):
    df['comp_pct'] = (df['completions'] / df['attempts']) * 100
    if year <= 2024:
        df['sack_rate'] = (df['sacks'] / (df['sacks'] + df['attempts'])) * 100
        df['total_turnovers'] = df['interceptions'] + df['rushing_fumbles_lost'] + df['receiving_fumbles_lost']
    else:
        df['sack_rate'] = (df['sacks_suffered'] / (df['sacks_suffered'] + df['attempts'])) * 100
        df['total_turnovers'] = df['passing_interceptions'] + df['rushing_fumbles_lost'] + df['receiving_fumbles_lost']
    df['yac_pct'] = df['receiving_yards_after_catch'] / df['receiving_yards'] * 100
    df['passing_adot'] = df['passing_air_yards'] / df['attempts']
    df['receiving_adot'] = df['receiving_air_yards'] / df['targets']
    return df

def get_player_stats_data():
    player_stats_data_df_list = {}
    for year in range(1999, 2026):
        print(f"Downloading player stats for {year}")
        base_url_std = 'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_season_' + str(year) + '.csv.gz'
        if year == 2025:
            base_url_std = 'https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_regpost_' + str(year) + '.csv.gz'
        raw_player_stats_data = pd.read_csv(base_url_std, compression='gzip', low_memory=False)
        player_stats_data_df_list[year] = raw_player_stats_data
    return player_stats_data_df_list

def create_database_online(conn: sqlite3.Connection):
    # Establish db connection 
    cursor = conn.cursor()

    player_stats_data_df_list = get_player_stats_data()
    for year, df in player_stats_data_df_list.items():
        table_name = f'player_stats_season_{year}'
        df = generate_derived_column_stats(df, year)
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_player_season ON {table_name}(player_id, season)")
        print(f"Created table {table_name} with {len(df)} rows")

    # Commit changes and close connection
    conn.commit()
    conn.close()
    print("Online database setup complete!")

def create_database(conn: sqlite3.Connection):
    # Establish database connection
    cursor = conn.cursor()

    # Get all CSV files in the player_stats_season directory
    csv_dir = Path('player_stats_season')
    csv_files = list(csv_dir.glob('player_stats_season_*.csv'))

    for csv_file in csv_files:
        # Read the CSV file
        df = pd.read_csv(csv_file)
        
        # Create table name from the CSV filename (without extension)
        table_name = csv_file.stem
        year = int(table_name.replace("player_stats_season_", "").replace(".csv", ""))

        # Generate additional derived columns
        final_df = generate_derived_column_stats(df, year)
        
        # Create the table
        final_df.to_sql(table_name, conn, if_exists='replace', index=False)
        
        print(f"Created table {table_name} with {len(final_df)} rows")

    # Create an index on player_id and season for faster queries
    for csv_file in csv_files:
        table_name = csv_file.stem
        cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_player_season ON {table_name}(player_id, season)")
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    print("Database setup complete!")

if __name__ == "__main__":
    conn = sqlite3.connect('nfl_stats.db')
    create_database_online(conn) 