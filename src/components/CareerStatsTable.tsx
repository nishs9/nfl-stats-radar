'use client';

import React from 'react';
import { CareerStats, getStatsForPosition } from '@/types/player';

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
  return `${(value * 100).toFixed(1)}%`;
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
    const baseColumns = ['season', 'team'];
    
    switch (pos) {
      case 'QB':
        return [...baseColumns, 'passing_yards', 'passing_epa', 'comp_pct', 'rushing_yards', 'fantasy_points_ppr'];
      case 'RB':
        return [...baseColumns, 'rushing_yards', 'receiving_yards', 'target_share', 'fantasy_points_ppr'];
      case 'WR':
      case 'TE':
        return [...baseColumns, 'receiving_yards', 'target_share', 'racr', 'fantasy_points_ppr'];
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
    racr: 'RACR',
    fantasy_points_ppr: 'FP (PPR)',
    games: 'Games'
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
      case 'target_share':
        return formatPercentage(value as number);
      default:
        return formatNumber(value as number);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
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
      
      {/* Mobile-friendly note */}
      <div className="mt-4 text-xs text-gray-500 text-center md:hidden">
        Scroll horizontally to view all columns
      </div>
    </div>
  );
}
