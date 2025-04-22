'use client';

import React, { use, useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { PlayerDataResponse, getStatsForPosition } from '@/types/player'; 
import PercentileSlider from '@/components/PercentileSlider';
import Image from 'next/image';

// Try using PageProps directly
export default function PlayerPage({params}: {params: Promise<{ playerId: string }>}) {
  const [playerData, setPlayerData] = useState<PlayerDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  
  // params should be directly usable here in a client component
  const playerId = use(params).playerId; // Extract playerId from params

  useEffect(() => {
    async function fetchPlayerData() {
      // ... fetch logic ...
      setIsLoading(true);
      setImageError(false);
      try {
        const seasonParam = selectedSeason ? `?season=${selectedSeason}` : '';
        // Use the extracted playerId
        const response = await fetch(`/api/player/${playerId}${seasonParam}`); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }
        
        const data: PlayerDataResponse = await response.json();
        setPlayerData(data);
        
        if (selectedSeason === null && data.seasons && data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0]);
        }
      } catch (err) {
        setError('Error loading player data. Please try again.');
        console.error('Error fetching player data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId, selectedSeason]); 

  // ... (rest of the component logic remains the same) ...
  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(Number(e.target.value));
  };

  const getDefaultImageUrl = () => {
    return "/placeholder.jpg";
  };

  if (isLoading) { /* ... loading JSX ... */ 
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error || !playerData) { /* ... error JSX ... */ 
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error || 'Could not load player data'}
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

  const { playerInfo, seasons, stats, percentiles } = playerData;
  const statDefinitions = getStatsForPosition(playerInfo.position); 
  const fallbackSrc = getDefaultImageUrl();

  return ( /* ... component JSX ... */ 
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        className="mb-8 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        onClick={() => router.push('/')}
      >
        ← Back to Search
      </button>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-800 text-white p-6">
           <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-6 bg-gray-700">
              <Image 
                src={!imageError && playerInfo.headshot_url ? playerInfo.headshot_url : fallbackSrc}
                alt={playerInfo.player_display_name}
                layout="fill" 
                objectFit="cover" 
                onError={() => {
                  if (!imageError) setImageError(true); 
                }}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{playerInfo.player_display_name}</h1>
              <div className="text-xl text-gray-300 mt-1">{playerInfo.position} • {playerInfo.recent_team}</div>
              
              <div className="mt-4">
                <label htmlFor="season" className="block text-sm font-medium text-gray-300">
                  Season
                </label>
                <select
                  id="season"
                  value={selectedSeason || ''}
                  onChange={handleSeasonChange}
                  className="mt-1 block w-full md:w-40 py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {seasons.map((season) => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Statistical Rankings for {selectedSeason}</h2>
          
          {!stats || !percentiles ? (
            <div className="text-gray-500">No stats available for the selected season.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {statDefinitions.map((statDef) => { 
                if (percentiles[statDef.key] === undefined) return null;
                
                return (
                  <PercentileSlider 
                    key={statDef.key}
                    stat={statDef} 
                    percentile={percentiles[statDef.key]}
                    value={stats[statDef.key]} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}