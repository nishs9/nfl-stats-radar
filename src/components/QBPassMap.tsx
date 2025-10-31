'use client';

import React, { useState, useEffect } from 'react';
import { PassMapResponse, PassMapData, PassMapStatOption } from '@/types/player';
import PassMapCell from './PassMapCell';
import PassMapStatSelector, { AVAILABLE_STATS } from './PassMapStatSelector';

interface QBPassMapProps {
  playerId: string;
  season: number;
}

const DISTANCES = ['long', 'medium_long', 'medium', 'short'] as const;
const DISTANCE_LABELS: Record<string, string> = {
  'short': 'Short (≤5 yds)',
  'medium': 'Medium (6-10 yds)',
  'medium_long': 'Med-Long (11-15 yds)',
  'long': 'Long (>15 yds)'
};

const LOCATIONS = ['left', 'middle', 'right'] as const;
const LOCATION_LABELS: Record<string, string> = {
  'left': 'Left',
  'middle': 'Middle',
  'right': 'Right'
};

export default function QBPassMap({ playerId, season }: QBPassMapProps) {
  const [passMapData, setPassMapData] = useState<PassMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStats, setSelectedStats] = useState<string[]>([
    'attempts',
    'completions',
    'completionPct',
    'passingYards',
    'touchdowns',
    'interceptions'
  ]);

  useEffect(() => {
    async function fetchPassMapData() {
      if (!playerId || !season) {
        setError('Missing player ID or season');
        setIsLoading(false);
        return;
      }

      // Validate season range
      if (season < 2019) {
        setError('Pass map data is only available from 2019 onwards. Please select a more recent season.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/player/${playerId}/pass-map?season=${season}`, {
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch pass map data' }));
          
          // Handle specific error cases
          if (errorData.isPre2019) {
            throw new Error('Pass map data is only available from 2019 onwards. Please select a more recent season.');
          }
          
          if (errorData.isDataUnavailable) {
            throw new Error(`Play-by-play data is not available for the ${season} season.`);
          }
          
          if (errorData.isFuture) {
            throw new Error('Pass map data is not available for future seasons.');
          }
          
          throw new Error(errorData.error || 'Failed to fetch pass map data');
        }

        const data: PassMapResponse = await response.json();
        
        // Validate response data
        if (!data.passMapData) {
          throw new Error('Invalid response format from server');
        }
        
        setPassMapData(data.passMapData);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'TimeoutError') {
            setError('Request timed out. Please try again.');
          } else if (err.name === 'AbortError') {
            setError('Request was cancelled. Please try again.');
          } else {
            setError(err.message);
          }
        } else {
          setError('An unexpected error occurred while loading pass map data');
        }
        console.error('Error fetching pass map:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPassMapData();
  }, [playerId, season]);

  const handleStatsChange = (newStats: string[]) => {
    setSelectedStats(newStats);
  };

  // Get selected stat options for display
  const selectedStatOptions = AVAILABLE_STATS.filter(stat => selectedStats.includes(stat.key));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800 font-medium">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!passMapData) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-gray-600 font-medium">No pass map data available</p>
        <p className="mt-1 text-xs text-gray-500">This could be due to no passing plays being recorded for this player in the selected season.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Selector */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PassMapStatSelector 
          selectedStats={selectedStats} 
          onStatsChange={handleStatsChange} 
        />
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Completion %:</span>
          <div className="flex items-center gap-1">
            <div className="w-8 h-4 rounded" style={{ backgroundColor: 'rgb(239, 68, 68)' }}></div>
            <span className="text-xs text-gray-500">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-4 rounded" style={{ backgroundColor: 'rgb(250, 204, 21)' }}></div>
            <span className="text-xs text-gray-500">Mid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-4 rounded" style={{ backgroundColor: 'rgb(34, 197, 94)' }}></div>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </div>

      {/* Pass Map Grid */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-0 bg-white">
            {/* Header Row */}
            <div className="border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-3"></div>
            {LOCATIONS.map(location => (
              <div
                key={location}
                className="border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-3 text-center font-bold text-gray-800 text-sm"
              >
                {LOCATION_LABELS[location]}
              </div>
            ))}

            {/* Data Rows */}
            {DISTANCES.map(distance => (
              <React.Fragment key={distance}>
                {/* Distance Label */}
                <div className="border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex items-center justify-center font-bold text-gray-800 text-sm whitespace-nowrap min-w-[120px]">
                  <div className="text-center">
                    {DISTANCE_LABELS[distance]}
                  </div>
                </div>

                {/* Cells for each location */}
                {LOCATIONS.map(location => {
                  const key = `${distance}_${location}`;
                  const cellStats = passMapData[key];

                  return (
                    <PassMapCell
                      key={key}
                      stats={cellStats}
                      distance={distance}
                      location={location}
                      selectedStats={selectedStatOptions}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>


      <div className="text-xs text-gray-500 text-center md:hidden">
        Scroll horizontally to view all columns
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-2">QB Pass Map Info</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>QB pass maps are only available from 2019 onwards.</li>
            <li>QB pass maps are based on regular season data only.</li>
            <li>Cell colors represent completion percentage: red (low) → yellow (mid) → green (high)</li>
            <li>Use the stat selector above to customize which statistics are displayed in each cell</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

