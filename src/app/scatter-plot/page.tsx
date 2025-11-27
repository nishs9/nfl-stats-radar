'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScatterPlot from '@/components/ScatterPlot';

interface ScatterPlotDataPoint {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  xValue: number | null;
  yValue: number | null;
}

interface ScatterPlotResponse {
  dataPoints: ScatterPlotDataPoint[];
  metadata: {
    season: number;
    xStat: string;
    yStat: string;
    positions: string[];
    totalPoints: number;
  };
  availableStats: string[];
}

export default function ScatterPlotPage() {
  const router = useRouter();
  const [data, setData] = useState<ScatterPlotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [season, setSeason] = useState<number>(2024);
  const [xStat, setXStat] = useState<string>('passing_yards');
  const [yStat, setYStat] = useState<string>('passing_tds');
  const [selectedPositions, setSelectedPositions] = useState<string[]>(['QB', 'RB', 'WR', 'TE']); // Default to all positions
  const [availableStats, setAvailableStats] = useState<string[]>([]);
  const [showNames, setShowNames] = useState<boolean>(false);

  // Available seasons
  const seasons = Array.from({ length: 2025 - 1999 + 1 }, (_, i) => 2025 - i);
  const positions = ['QB', 'RB', 'WR', 'TE'];

  // Fetch available stats on mount
  useEffect(() => {
    async function fetchAvailableStats() {
      try {
        // Make a dummy request just to get available stats
        const response = await fetch('/api/scatter-plot?season=2024&xStat=passing_yards&yStat=passing_tds');
        if (response.ok) {
          const result: ScatterPlotResponse = await response.json();
          setAvailableStats(result.availableStats);
        }
      } catch (err) {
        console.error('Error fetching available stats:', err);
      }
    }

    fetchAvailableStats();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!xStat || !yStat || availableStats.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          season: season.toString(),
          xStat,
          yStat,
        });

        if (selectedPositions.length > 0 && selectedPositions.length < positions.length) {
          queryParams.append('positions', selectedPositions.join(','));
        }

        const response = await fetch(`/api/scatter-plot?${queryParams.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch scatter plot data');
        }

        const result: ScatterPlotResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading scatter plot data');
        console.error('Error fetching scatter plot:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [season, xStat, yStat, selectedPositions, availableStats.length]);

  // Format stat name for display
  const formatStatName = (stat: string): string => {
    return stat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mb-4"
          onClick={() => router.push('/')}
        >
          ← Back to Home
        </button>
        
        <h1 className="text-3xl font-bold mb-2">NFL Stats Scatter Plot</h1>
        <p className="text-gray-600">
          Create a scatter plot from various offensive player statistics. Hover on a point for more details. Click on a point to view the player's profile page.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Season Selector */}
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              id="season"
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* X-Axis Stat Selector */}
          <div>
            <label htmlFor="xStat" className="block text-sm font-medium text-gray-700 mb-2">
              X-Axis Stat
            </label>
            <select
              id="xStat"
              value={xStat}
              onChange={(e) => setXStat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {availableStats.length > 0 ? (
                availableStats.map((stat) => (
                  <option key={stat} value={stat}>{formatStatName(stat)}</option>
                ))
              ) : (
                <option value="">Loading...</option>
              )}
            </select>
          </div>

          {/* Y-Axis Stat Selector */}
          <div>
            <label htmlFor="yStat" className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis Stat
            </label>
            <select
              id="yStat"
              value={yStat}
              onChange={(e) => setYStat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {availableStats.length > 0 ? (
                availableStats.map((stat) => (
                  <option key={stat} value={stat}>{formatStatName(stat)}</option>
                ))
              ) : (
                <option value="">Loading...</option>
              )}
            </select>
          </div>
        </div>

        {/* Position Filter Checkboxes */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Position Filter
          </label>
          <div className="flex flex-wrap gap-4">
            {positions.map((pos) => (
              <label key={pos} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPositions.includes(pos)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPositions([...selectedPositions, pos]);
                    } else {
                      setSelectedPositions(selectedPositions.filter(p => p !== pos));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{pos}</span>
              </label>
            ))}
            <button
              onClick={() => {
                if (selectedPositions.length === positions.length) {
                  setSelectedPositions([]);
                } else {
                  setSelectedPositions([...positions]);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {selectedPositions.length === positions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        
        {/* Toggle for showing names */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <input
            type="checkbox"
            id="showNames"
            checked={showNames}
            onChange={(e) => setShowNames(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showNames" className="text-sm font-medium text-gray-700 cursor-pointer">
            Show player names on plot
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Scatter Plot */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12 bg-white shadow-lg rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : data && data.dataPoints.length > 0 ? (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {formatStatName(xStat)} vs {formatStatName(yStat)} ({season})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.metadata.totalPoints} players shown
              {selectedPositions.length < positions.length && (
                ` • Filtered by ${selectedPositions.join(', ')}`
              )}
            </p>
          </div>
          <ScatterPlot
            dataPoints={data.dataPoints}
            xStat={xStat}
            yStat={yStat}
            season={season}
            showNames={showNames}
          />
        </div>
      ) : data && data.dataPoints.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-12 text-center">
          <p className="text-gray-600">No data available for the selected filters.</p>
        </div>
      ) : null}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-blue-900 mb-2">About Scatter Plots</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Each point represents a player from the selected season</li>
          <li>Points are colored by position</li>
          <li>Hover over points to see player details</li>
          <li>You can filter by position or view all positions together</li>
        </ul>
      </div>
    </div>
  );
}

