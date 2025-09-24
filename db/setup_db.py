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

def create_database():
    # Create database connection
    conn = sqlite3.connect('nfl_stats.db')
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
    create_database() 