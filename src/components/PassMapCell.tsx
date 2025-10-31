'use client';

import React from 'react';
import { PassMapCellStats, PassMapStatOption } from '@/types/player';

interface PassMapCellProps {
  stats: PassMapCellStats;
  distance: string;
  location: string;
  selectedStats: PassMapStatOption[];
}

function formatStatValue(value: number | null, format: 'number' | 'percentage' | 'decimal' | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  if (!isFinite(value)) {
    return 'N/A';
  }

  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      const decimalStr = value.toFixed(2);
      return value > 0 ? `+${decimalStr}` : decimalStr;
    case 'number':
    default:
      const rounded = Math.round(value);
      return rounded.toString();
  }
}

function getCompletionPercentageColor(completionPct: number | null): string {
  if (completionPct === null || completionPct === undefined) {
    return 'rgb(229, 231, 235)'; // gray-200
  }

  // Color scale from red (low) to green (high)
  // 0% = red (239, 68, 68) - red-500
  // 50% = yellow (250, 204, 21) - yellow-400
  // 100% = green (34, 197, 94) - green-500
  
  const percentage = Math.max(0, Math.min(100, completionPct));
  
  let r: number, g: number, b: number;
  
  if (percentage <= 50) {
    // Interpolate from red to yellow
    const ratio = percentage / 50;
    r = Math.round(239 + (250 - 239) * ratio);
    g = Math.round(68 + (204 - 68) * ratio);
    b = Math.round(68 + (21 - 68) * ratio);
  } else {
    // Interpolate from yellow to green
    const ratio = (percentage - 50) / 50;
    r = Math.round(250 + (34 - 250) * ratio);
    g = Math.round(204 + (197 - 204) * ratio);
    b = Math.round(21 + (94 - 21) * ratio);
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

function getTextColor(completionPct: number | null): string {
  if (completionPct === null || completionPct === undefined) {
    return 'text-gray-600';
  }
  
  if (completionPct < 35 || completionPct > 65) {
    return 'text-white';
  }
  
  return 'text-gray-900';
}

export default function PassMapCell({ stats, distance, location, selectedStats }: PassMapCellProps) {
  const backgroundColor = getCompletionPercentageColor(stats.completionPct);
  const textColor = getTextColor(stats.completionPct);
  
  const isActive = stats.attempts > 0;

  return (
    <div
      className={`border border-gray-300 p-3 flex flex-col justify-center items-center min-h-[140px] transition-all duration-200 hover:shadow-lg ${textColor}`}
      style={{ backgroundColor }}
      title={isActive ? `${distance} ${location}: ${stats.attempts} attempts` : 'No data available'}
    >
      {isActive ? (
        <div className="text-center w-full space-y-0.5">
          {selectedStats.map((stat) => {
            const value = stats[stat.key];
            const formattedValue = formatStatValue(value as number | null, stat.format);
            
            return (
              <div key={stat.key} className="text-xs leading-tight">
                <span className="font-semibold">{stat.label}:</span>{' '}
                <span className="font-normal">{formattedValue}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 text-sm font-medium">
          No Data
        </div>
      )}
    </div>
  );
}

