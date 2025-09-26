'use client';

import React from 'react';
import { CareerStats } from '@/types/player';

interface CareerStatsTableProps {
  careerStats: CareerStats[];
  position: string;
}

// Helper function to format numbers
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    } else {
      return value.toFixed(2);
    }
  }
  return String(value);
}

// Helper function to format percentages
function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  // If the value is already a percentage (like 66.849), just format it
  // If it's a decimal (like 0.66849), multiply by 100
  if (value > 1) {
    return `${value.toFixed(1)}%`;
  } else {
    return `${(value * 100).toFixed(1)}%`;
  }
}

export default function CareerStatsTable({ careerStats, position }: CareerStatsTableProps) {
  if (!careerStats || careerStats.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No career stats available.
      </div>
    );
  }

  // Define which columns to show based on position
  const getColumnsForPosition = (pos: string) => {
    const baseColumns = ['season', 'team', 'games'];
    
    switch (pos) {
      case 'QB':
        return [...baseColumns, 'completions', 'attempts', 'comp_pct', 'passing_yards', 'passing_air_yards', 'passing_tds', 'interceptions', 'passing_epa', 'carries', 'rushing_yards', 'yards_per_carry', 'rushing_tds', 'rushing_epa', 'fantasy_points_ppr'];
      case 'RB':
        return [...baseColumns, 'carries', 'rushing_yards', 'yards_per_carry', 'rushing_tds', 'rushing_epa', 'receptions', 'receiving_yards', 'receiving_yards_after_catch', 'yards_per_target', 'receiving_tds', 'receiving_epa', 'target_share', 'fantasy_points_ppr'];
      case 'WR':
        return [...baseColumns, 'receptions', 'receiving_yards', 'receiving_yards_after_catch', 'yards_per_target', 'receiving_tds', 'receiving_epa', 'target_share', 'racr', 'carries', 'rushing_yards', 'yards_per_carry', 'rushing_tds', 'rushing_epa', 'fantasy_points_ppr'];
      case 'TE':
        return [...baseColumns, 'receptions', 'receiving_yards', 'receiving_yards_after_catch', 'yards_per_target', 'receiving_tds', 'receiving_epa', 'target_share', 'racr', 'fantasy_points_ppr'];
      default:
        return [...baseColumns, 'games', 'fantasy_points_ppr'];
    }
  };

  const columns = getColumnsForPosition(position);

  // Column headers mapping
  const columnHeaders: Record<string, string> = {
    season: 'Season',
    team: 'Team',
    passing_yards: 'Pass Yds',
    passing_epa: 'Pass EPA',
    comp_pct: 'Comp %',
    rushing_yards: 'Rush Yds',
    receiving_yards: 'Rec Yds',
    target_share: 'Target %',
    air_yards_share: 'Air Yds %',
    yac_pct: 'YAC %',
    racr: 'RACR',
    fantasy_points_ppr: 'FP (PPR)',
    games: 'Games',
    completions: 'Comps',
    attempts: 'Att',
    passing_air_yards: 'Air Yds',
    passing_tds: 'Pass TDs',
    rushing_tds: 'Rush TDs',
    receiving_tds: 'Rec TDs',
    receiving_yards_after_catch: 'YAC',
    receiving_epa: 'Rec EPA',
    rushing_epa: 'Rush EPA',
    receptions: 'Catches',
    interceptions: 'Ints',
    passing_interceptions: 'Ints',
    yards_per_carry: 'Yds/Carry',
    yards_per_target: 'Yds/Tgt',
  };

  // Render cell content based on column type
  const renderCellContent = (stat: CareerStats, column: string) => {
    const value = stat[column as keyof CareerStats];
    
    switch (column) {
      case 'season':
        return stat.season;
      case 'team':
        return stat.recent_team;
      case 'comp_pct':
        return formatPercentage(value as number);
      case 'target_share':
        return formatPercentage(value as number);
      default:
        return formatNumber(value as number);
    }
  };

  return (
    <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm" style={{ minWidth: '800px' }}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap"
              >
                {columnHeaders[column] || column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {careerStats.map((stat, index) => (
            <tr key={`${stat.season}-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
              {columns.map((column) => (
                <td
                  key={column}
                  className="px-3 py-3 text-sm text-gray-900 border-b border-gray-100 whitespace-nowrap"
                >
                  {renderCellContent(stat, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
  );
}
