import pandas as pd
import numpy as np

# Decay factor for recency weighting
alpha = 0.125

# Sensitivity factor for margin-of-victory weighting
k = 0.085

## Suppress this warning SettingWithCopyWarning
pd.options.mode.chained_assignment = None  # default='warn'

def calculate_smoothed_win_pct(wins: int, games: int, alpha: float = 0.5, beta: float = 0.5) -> float:
    return (wins + alpha) / (games + alpha + beta)

def compute_rpi_from_schedule(schedule_df: pd.DataFrame, max_week: int) -> pd.DataFrame:
    # ---- Expand schedule into team-centric view ----
    home_df = schedule_df[['season', 'week', 'home_team', 'away_team', 'home_score', 'away_score']]
    home_df["score_diff"] = home_df["home_score"] - home_df["away_score"]
    home_df = home_df.rename(columns={
        'home_team': 'team', 'away_team': 'opp',
        'home_score': 'team_score', 'away_score': 'opp_score'
    })
    home_df['is_home'] = 1

    away_df = schedule_df[['season', 'week', 'home_team', 'away_team', 'home_score', 'away_score']]
    away_df["score_diff"] = away_df["away_score"] - away_df["home_score"]
    away_df = away_df.rename(columns={
        'away_team': 'team', 'home_team': 'opp',
        'away_score': 'team_score', 'home_score': 'opp_score'
    })
    away_df['is_home'] = 0

    games_df = pd.concat([home_df, away_df], ignore_index=True)
    games_df['win'] = (games_df['team_score'] > games_df['opp_score']).astype(int)
    # Applies a recency-based weight to team wins
    games_df["r_weight"] = np.exp(-1 * alpha * (max_week - games_df['week']))
    games_df['win_r'] = games_df['win'] * games_df["r_weight"]
    # Applies a weight to wins based on margin of victory
    games_df["mov_weight"] = (1 / (1 + np.exp(-1 * k * games_df["score_diff"])))
    games_df['win_mov'] = games_df['win'] * games_df["mov_weight"]

    teams = games_df['team'].unique()
    results = []

    # ---- Compute standard and recency-weighted win% (WP) for each team ----
    team_wp = {}
    team_wp_r = {}
    team_wp_mov = {}
    for team in teams:
        t_games = games_df[games_df['team'] == team]
        wp = calculate_smoothed_win_pct(t_games['win'].sum(), len(t_games))
        wp_r = calculate_smoothed_win_pct(t_games['win_r'].sum(), t_games['r_weight'].sum())
        wp_mov = calculate_smoothed_win_pct(t_games['win_mov'].sum(), t_games['mov_weight'].sum())
        team_wp[team] = wp
        team_wp_r[team] = wp_r
        team_wp_mov[team] = wp_mov

    # ---- Compute average win percentage of opponents (OWP) ----
    team_owp = {}
    team_owp_r = {}
    team_owp_mov = {}
    for team in teams:
        opps = games_df.loc[games_df['team'] == team, 'opp'].unique()
        opp_wp_values = []
        opp_wp_r_values = []
        opp_wp_mov_values = []
        for opp in opps:
            opp_games = games_df[(games_df['team'] == opp) & (games_df['opp'] != team)]
            if len(opp_games) > 0:
                opp_wp = calculate_smoothed_win_pct(opp_games['win'].sum(), len(opp_games))
                opp_wp_r = calculate_smoothed_win_pct(opp_games['win_r'].sum(), opp_games['r_weight'].sum())
                opp_wp_mov = calculate_smoothed_win_pct(opp_games['win_mov'].sum(), opp_games['mov_weight'].sum())
                opp_wp_values.append(opp_wp)
                opp_wp_r_values.append(opp_wp_r)
                opp_wp_mov_values.append(opp_wp_mov)

        team_owp[team] = np.mean(opp_wp_values)
        team_owp_r[team] = np.mean(opp_wp_r_values)
        team_owp_mov[team] = np.mean(opp_wp_mov_values)

    # ---- Compute average OWP (opp of opp win%) ----
    team_oowp = {}
    team_oowp_r = {}
    team_oowp_mov = {}
    for team in teams:
        opps = games_df.loc[games_df['team'] == team, 'opp'].unique()
        owp_vals = [team_owp.get(o) for o in opps]
        owp_r_vals = [team_owp_r.get(o) for o in opps]
        owp_mov_vals = [team_owp_mov.get(o) for o in opps]
        team_oowp[team] = np.mean(owp_vals)
        team_oowp_r[team] = np.mean(owp_r_vals)
        team_oowp_mov[team] = np.mean(owp_mov_vals)

    # ---- Final RPI formula ----
    for team in teams:
        rpi = 0.25 * team_wp[team] + 0.50 * team_owp[team] + 0.25 * team_oowp[team]
        rpi_r = 0.25 * team_wp_r[team] + 0.50 * team_owp_r[team] + 0.25 * team_oowp_r[team]
        rpi_mov = 0.25 * team_wp_mov[team] + 0.50 * team_owp_mov[team] + 0.25 * team_oowp_mov[team]
        comp_rpi = 0.35 * rpi + 0.15 * rpi_r + 0.50 * rpi_mov
        games_played = len(games_df[games_df['team'] == team])
        results.append({
            'team': team,
            'games_played': games_played,
            'win_pct': team_wp[team],
            'opp_win_pct': team_owp[team],
            'opp_opp_win_pct': team_oowp[team],
            'rpi': rpi,
            'rpi_r': rpi_r,
            'rpi_mov': rpi_mov,
            'comp_rpi': comp_rpi
        })

    df = pd.DataFrame(results)
    df['rpi_z_score'] = (df['rpi'] - df['rpi'].mean()) / df['rpi'].std(ddof=0)
    df['rpi_r_z_score'] = (df['rpi_r'] - df['rpi_r'].mean()) / df['rpi_r'].std(ddof=0)
    df['rpi_mov_z_score'] = (df['rpi_mov'] - df['rpi_mov'].mean()) / df['rpi_mov'].std(ddof=0)
    df['comp_rpi_z_score'] = (df['comp_rpi'] - df['comp_rpi'].mean()) / df['comp_rpi'].std(ddof=0)
    return df