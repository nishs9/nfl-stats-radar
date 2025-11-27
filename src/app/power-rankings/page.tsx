'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RPIRanking, PowerRankingsResponse } from '@/types/player';

type SortColumn = 'rpi_rank' | 'wins' | 'losses' | 'games_played' | 'win_pct' | 'comp_rpi';
type SortDirection = 'asc' | 'desc';

export default function PowerRankingsPage() {
  const [rankings, setRankings] = useState<RPIRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('rpi_rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();

  useEffect(() => {
    async function fetchRankings() {
      try {
        const response = await fetch('/api/power-rankings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch power rankings');
        }
        
        const data: PowerRankingsResponse = await response.json();
        setRankings(data.rankings);
      } catch (err) {
        setError('Error loading power rankings. Please try again.');
        console.error('Error fetching power rankings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRankings();
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new column
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRankings = [...rankings].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Helper function to format win percentage
  const formatWinPct = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Helper function to format RPI
  const formatRPI = (value: number): string => {
    return value.toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mb-4"
          onClick={() => router.push('/')}
        >
          ← Back to Home
        </button>
        
        <h1 className="text-3xl font-bold mb-2">NFL Power Rankings</h1>
        <p className="text-gray-600">Power rankings based on Composite Rating Percentage Index (Composite RPI) for the 2025 season</p>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-blue-900 mb-2">About Power Rankings</h3>
        <p className="text-sm text-blue-800">
          Composite RPI is my own version of <a href="https://en.wikipedia.org/wiki/Rating_percentage_index" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Rating Percentage Index (RPI)</a> that 
          takes recent form and margin of victory into account along with record and strength of schedule. A higher Composite RPI indicates a stronger team. These rankings will be updated weekly.
        </p>
      </div>

      {/* Rankings Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
             <thead className="bg-gray-50">
               <tr>
                 <th 
                   className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
                   onClick={() => handleSort('rpi_rank')}
                 >
                   <div className="flex items-center">
                     Rank
                     <SortIcon column="rpi_rank" />
                   </div>
                 </th>
                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                   Team
                 </th>
                 <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('games_played')}
                >
                  <div className="flex items-center">
                    Games Played
                    <SortIcon column="games_played" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('wins')}
                >
                  <div className="flex items-center">
                    Wins
                    <SortIcon column="wins" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('losses')}
                >
                  <div className="flex items-center">
                    Losses
                    <SortIcon column="losses" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('win_pct')}
                >
                  <div className="flex items-center">
                    Win %
                    <SortIcon column="win_pct" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('comp_rpi')}
                >
                  <div className="flex items-center">
                    Composite RPI
                    <SortIcon column="comp_rpi" />
                  </div>
                </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {sortedRankings.map((ranking) => (
                 <tr 
                   key={ranking.team} 
                   className="hover:bg-gray-50 transition-colors duration-150"
                 >
                  {/* Rank Column */}
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                      ranking.rpi_rank <= 3 ? 'bg-green-100 text-green-800' :
                      ranking.rpi_rank <= 10 ? 'bg-blue-100 text-blue-800' :
                      ranking.rpi_rank <= 20 ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ranking.rpi_rank}
                    </span>
                  </td>
                  {/* Team Logo and Name Column */}
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {ranking.team_logo_squared && (
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <Image
                            src={ranking.team_logo_squared}
                            alt={`${ranking.team_name} logo`}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold">{ranking.team_name || ranking.team}</span>
                        <span className="text-xs text-gray-500">{ranking.team}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                    {ranking.games_played}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                    {ranking.wins}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                    {ranking.losses}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                    {formatWinPct(ranking.win_pct)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100 font-mono">
                    {formatRPI(ranking.comp_rpi)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile scroll hint */}
        <div className="mt-4 text-xs text-gray-500 text-center md:hidden px-4 pb-4">
          Scroll horizontally to view all columns
        </div>
      </div>

    </div>
  );
}

