'use client';

import React, { use, useState, useEffect } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { PlayerDataResponse, GameLogsResponse, getStatsForPosition } from '@/types/player'; 
import PercentileSlider from '@/components/PercentileSlider';
import CareerStatsTable from '@/components/CareerStatsTable';
import GameLogsTable from '@/components/GameLogsTable';
import Image from 'next/image';

// Try using PageProps directly
export default function PlayerPage({params}: {params: Promise<{ playerId: string }>}) {
  const [playerData, setPlayerData] = useState<PlayerDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showGameLogs, setShowGameLogs] = useState(false);
  const [gameLogsData, setGameLogsData] = useState<GameLogsResponse | null>(null);
  const [gameLogsLoading, setGameLogsLoading] = useState(false);
  const [gameLogsError, setGameLogsError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // params should be directly usable here in a client component
  const playerId = use(params).playerId; // Extract playerId from params

  // Read season from URL query parameters on mount
  useEffect(() => {
    const seasonFromUrl = searchParams.get('season');
    if (seasonFromUrl && !isNaN(Number(seasonFromUrl))) {
      setSelectedSeason(Number(seasonFromUrl));
    }
  }, [searchParams]);

  // Function to fetch game logs data
  const fetchGameLogs = async (season: number) => {
    if (!playerId || !season) return;
    
    setGameLogsLoading(true);
    setGameLogsError(null);
    
    try {
      const response = await fetch(`/api/player/${playerId}/game-logs?season=${season}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch game logs');
      }
      
      const data: GameLogsResponse = await response.json();
      setGameLogsData(data);
    } catch (err) {
      setGameLogsError(err instanceof Error ? err.message : 'Error loading game logs');
      console.error('Error fetching game logs:', err);
    } finally {
      setGameLogsLoading(false);
    }
  };

  // Handle toggle between default view and game logs
  const handleToggleView = (showLogs: boolean) => {
    setShowGameLogs(showLogs);
    
    // Fetch game logs when switching to game logs view
    if (showLogs && selectedSeason) {
      fetchGameLogs(selectedSeason);
    }
  };

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
        
        // Only set default season if no season was specified in URL and selectedSeason is still null
        if (selectedSeason === null && data.seasons && data.seasons.length > 0 && !searchParams.get('season')) {
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
  }, [playerId, selectedSeason, searchParams]);

  // ... (rest of the component logic remains the same) ...
  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = Number(e.target.value);
    setSelectedSeason(newSeason);
    
    // If we're currently showing game logs, fetch the new season's game logs
    if (showGameLogs) {
      fetchGameLogs(newSeason);
    }
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

  const { playerInfo, seasons, stats, percentiles, careerStats } = playerData;
  const statDefinitions = getStatsForPosition(playerInfo.position); 
  const fallbackSrc = getDefaultImageUrl();

  return ( /* ... component JSX ... */ 
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex gap-4">
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
          onClick={() => router.push('/')}
        >
          ← Back to Search
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          onClick={() => router.push(`/compare/${playerId}`)}
        >
          Compare Player
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="text-white p-6" style={{ backgroundColor: 'var(--brand-primary)' }}>
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
              
              <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    View Type
                  </label>
                  <div className="flex bg-gray-700 rounded-md p-1">
                    <button
                      onClick={() => handleToggleView(false)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        !showGameLogs 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Season Stats
                    </button>
                    <button
                      onClick={() => handleToggleView(true)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        showGameLogs 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Game Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!showGameLogs ? (
            // Default view - Season Stats with Percentile Rankings
            <>
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
                        playerId={playerId}
                        season={selectedSeason || 0}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            // Game Logs view
            <>
              <h2 className="text-2xl font-bold mb-6">Game Logs for {selectedSeason}</h2>
              
              {gameLogsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : gameLogsError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {gameLogsError}
                </div>
              ) : gameLogsData && gameLogsData.gameLogs.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <GameLogsTable 
                      gameLogs={gameLogsData.gameLogs} 
                      position={playerInfo.position} 
                    />
                  </div>
                  <div className="mt-4 text-xs text-gray-500 text-center md:hidden">
                    Scroll horizontally to view all columns
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No game logs available for this season.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Career Statistics</h2>
          <div className="overflow-x-auto">
            <CareerStatsTable 
              careerStats={careerStats || []} 
              position={playerInfo.position} 
            />
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center md:hidden">
            Scroll horizontally to view all columns
          </div>
        </div>
      </div>
    </div>
  );
}