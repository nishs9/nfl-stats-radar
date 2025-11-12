'use client';

import React, { useState, useEffect } from 'react';
import { PassMapResponse, PassMapData } from '@/types/player';
import PassMapCell from './PassMapCell';
import PassMapStatSelector, { AVAILABLE_STATS } from './PassMapStatSelector';

interface PassMapComparisonProps {
  leftPlayerId: string;
  leftPlayerName: string;
  leftSeason: number;
  leftAvailableSeasons: number[];
  rightPlayerId: string;
  rightPlayerName: string;
  rightSeason: number;
  rightAvailableSeasons: number[];
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

export default function PassMapComparison({
  leftPlayerId,
  leftPlayerName,
  leftSeason,
  leftAvailableSeasons,
  rightPlayerId,
  rightPlayerName,
  rightSeason,
  rightAvailableSeasons
}: PassMapComparisonProps) {
  const [leftPassMapData, setLeftPassMapData] = useState<PassMapData | null>(null);
  const [rightPassMapData, setRightPassMapData] = useState<PassMapData | null>(null);
  const [isLoadingLeft, setIsLoadingLeft] = useState(true);
  const [isLoadingRight, setIsLoadingRight] = useState(true);
  const [errorLeft, setErrorLeft] = useState<string | null>(null);
  const [errorRight, setErrorRight] = useState<string | null>(null);
  const [selectedLeftSeason, setSelectedLeftSeason] = useState<number>(leftSeason);
  const [selectedRightSeason, setSelectedRightSeason] = useState<number>(rightSeason);
  const [selectedStats, setSelectedStats] = useState<string[]>([
    'completions',
    'completionPct',
    'airYards',
    'passingYards',
    'totalPassingEpaPerPlay',
    'touchdowns',
    'interceptions'
  ]);

  // Fetch left player pass map
  useEffect(() => {
    async function fetchLeftPassMap() {
      if (!leftPlayerId || !selectedLeftSeason) {
        setErrorLeft('Missing player ID or season');
        setIsLoadingLeft(false);
        return;
      }

      if (selectedLeftSeason < 2010) {
        setErrorLeft('Pass map data only available from 2010 onwards');
        setIsLoadingLeft(false);
        return;
      }

      setIsLoadingLeft(true);
      setErrorLeft(null);

      try {
        const response = await fetch(`/api/player/${leftPlayerId}/pass-map?season=${selectedLeftSeason}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch pass map data' }));
          throw new Error(errorData.error || 'Failed to fetch pass map data');
        }

        const data: PassMapResponse = await response.json();
        setLeftPassMapData(data.passMapData);
      } catch (err) {
        setErrorLeft(err instanceof Error ? err.message : 'Error loading pass map data');
      } finally {
        setIsLoadingLeft(false);
      }
    }

    fetchLeftPassMap();
  }, [leftPlayerId, selectedLeftSeason]);

  // Fetch right player pass map
  useEffect(() => {
    async function fetchRightPassMap() {
      if (!rightPlayerId || !selectedRightSeason) {
        setErrorRight('Missing player ID or season');
        setIsLoadingRight(false);
        return;
      }

      if (selectedRightSeason < 2010) {
        setErrorRight('Pass map data only available from 2010 onwards');
        setIsLoadingRight(false);
        return;
      }

      setIsLoadingRight(true);
      setErrorRight(null);

      try {
        const response = await fetch(`/api/player/${rightPlayerId}/pass-map?season=${selectedRightSeason}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch pass map data' }));
          throw new Error(errorData.error || 'Failed to fetch pass map data');
        }

        const data: PassMapResponse = await response.json();
        setRightPassMapData(data.passMapData);
      } catch (err) {
        setErrorRight(err instanceof Error ? err.message : 'Error loading pass map data');
      } finally {
        setIsLoadingRight(false);
      }
    }

    fetchRightPassMap();
  }, [rightPlayerId, selectedRightSeason]);

  const handleStatsChange = (newStats: string[]) => {
    setSelectedStats(newStats);
  };

  const selectedStatOptions = AVAILABLE_STATS.filter(stat => selectedStats.includes(stat.key));

  const renderPassMap = (
    passMapData: PassMapData | null,
    isLoading: boolean,
    error: string | null,
    playerName: string,
    season: number,
    availableSeasons: number[],
    onSeasonChange: (season: number) => void
  ) => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold">{playerName}</h3>
          <div className="flex items-center gap-2">
            <label htmlFor={`season-${playerName}`} className="text-sm font-medium text-gray-700">
              Season:
            </label>
            <select
              id={`season-${playerName}`}
              value={season}
              onChange={(e) => onSeasonChange(Number(e.target.value))}
              className="block py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {availableSeasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-800 font-medium">{error}</p>
          </div>
        ) : !passMapData ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-600 font-medium">No pass map data available for seasons before 2015</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-0 bg-white">
                {/* Header Row */}
                <div className="border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-2"></div>
                {LOCATIONS.map(location => (
                  <div
                    key={location}
                    className="border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-2 text-center font-bold text-gray-800 text-xs"
                  >
                    {LOCATION_LABELS[location]}
                  </div>
                ))}

                {/* Data Rows */}
                {DISTANCES.map(distance => (
                  <React.Fragment key={distance}>
                    {/* Distance Label */}
                    <div className="border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-2 flex items-center justify-center font-bold text-gray-800 text-xs whitespace-nowrap min-w-[100px]">
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
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Unified Stat Selector and Legend */}
      <div className="bg-white shadow-lg rounded-lg p-6">
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
      </div>

      {/* Side-by-Side Pass Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Player Pass Map */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          {renderPassMap(
            leftPassMapData, 
            isLoadingLeft, 
            errorLeft, 
            leftPlayerName, 
            selectedLeftSeason,
            leftAvailableSeasons,
            setSelectedLeftSeason
          )}
        </div>

        {/* Right Player Pass Map */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          {renderPassMap(
            rightPassMapData, 
            isLoadingRight, 
            errorRight, 
            rightPlayerName, 
            selectedRightSeason,
            rightAvailableSeasons,
            setSelectedRightSeason
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-2">QB Pass Map Comparison Info</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Pass map comparison is only available for QBs from 0 onwards</li>
            <li>Cell colors represent completion percentage: red (low) → yellow (mid) → green (high)</li>
            <li>Use the stat selector above to customize which statistics are displayed in both pass maps</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

