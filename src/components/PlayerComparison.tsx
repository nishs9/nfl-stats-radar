'use client';

import React, { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { PlayerDataResponse, getStatsForPosition, Player } from '@/types/player'; 
import PercentileSlider from '@/components/PercentileSlider';
import PlayerSearch from '@/components/PlayerSearch';
import Image from 'next/image';

interface PlayerComparisonProps {
  initialLeftPlayer?: {
    playerId: string;
    season?: number;
  };
}

export default function PlayerComparison({ initialLeftPlayer }: PlayerComparisonProps) {
  // Left player state
  const [leftPlayerData, setLeftPlayerData] = useState<PlayerDataResponse | null>(null);
  const [leftSelectedSeason, setLeftSelectedSeason] = useState<number | null>(initialLeftPlayer?.season || null);
  const [leftImageError, setLeftImageError] = useState(false);
  const [selectedLeftPlayer, setSelectedLeftPlayer] = useState<Player | null>(null);
  const [showLeftPlayerSearch, setShowLeftPlayerSearch] = useState(!initialLeftPlayer);
  
  // Right player state
  const [rightPlayerData, setRightPlayerData] = useState<PlayerDataResponse | null>(null);
  const [rightSelectedSeason, setRightSelectedSeason] = useState<number | null>(null);
  const [rightImageError, setRightImageError] = useState(false);
  const [selectedRightPlayer, setSelectedRightPlayer] = useState<Player | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(!!initialLeftPlayer);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Reusable function to fetch player data
  const fetchPlayerData = async (
    playerId: string,
    season: number | null,
    setPlayerData: (data: PlayerDataResponse | null) => void,
    setImageError: (error: boolean) => void,
    setSelectedSeason: (season: number) => void,
    isInitial = false
  ) => {
    if (isInitial) {
      setIsLoading(true);
    }
    setImageError(false);
    
    try {
      const seasonParam = season ? `?season=${season}` : '';
      const response = await fetch(`/api/player/${playerId}${seasonParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch player data');
      }
      
      const data: PlayerDataResponse = await response.json();
      setPlayerData(data);
      
      // Set default season if none specified
      if (season === null && data.seasons && data.seasons.length > 0) {
        setSelectedSeason(data.seasons[0]);
      }
    } catch (err) {
      if (isInitial) {
        setError('Error loading player data. Please try again.');
      }
      console.error(`Error fetching player data for ${playerId}:`, err);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  // Fetch initial left player data if provided
  useEffect(() => {
    if (!initialLeftPlayer) return;

    fetchPlayerData(
      initialLeftPlayer.playerId,
      leftSelectedSeason,
      setLeftPlayerData,
      setLeftImageError,
      setLeftSelectedSeason,
      true
    );
  }, [initialLeftPlayer, leftSelectedSeason]);

  // Fetch left player data when manually selected
  useEffect(() => {
    if (!selectedLeftPlayer) {
      setLeftPlayerData(null);
      return;
    }

    fetchPlayerData(
      selectedLeftPlayer.player_id,
      leftSelectedSeason,
      setLeftPlayerData,
      setLeftImageError,
      setLeftSelectedSeason
    );
  }, [selectedLeftPlayer, leftSelectedSeason]);

  // Fetch right player data when selected
  useEffect(() => {
    if (!selectedRightPlayer) {
      setRightPlayerData(null);
      return;
    }

    fetchPlayerData(
      selectedRightPlayer.player_id,
      rightSelectedSeason,
      setRightPlayerData,
      setRightImageError,
      setRightSelectedSeason
    );
  }, [selectedRightPlayer, rightSelectedSeason]);

  const handleLeftSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLeftSelectedSeason(Number(e.target.value));
  };

  const handleRightSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRightSelectedSeason(Number(e.target.value));
  };

  const getDefaultImageUrl = () => {
    return "/placeholder.jpg";
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

  const leftPlayerInfo = leftPlayerData?.playerInfo;
  const leftStats = leftPlayerData?.stats;
  const leftPercentiles = leftPlayerData?.percentiles;
  const leftSeasons = leftPlayerData?.seasons || [];

  const rightPlayerInfo = rightPlayerData?.playerInfo;
  const rightStats = rightPlayerData?.stats;
  const rightPercentiles = rightPlayerData?.percentiles;
  const rightSeasons = rightPlayerData?.seasons || [];

  // Get stat definitions
  const leftStatDefinitions = leftPlayerInfo ? getStatsForPosition(leftPlayerInfo.position) : [];
  const rightStatDefinitions = rightPlayerInfo ? getStatsForPosition(rightPlayerInfo.position) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-8 flex gap-4">
        {initialLeftPlayer ? (
          <button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
            onClick={() => router.push(`/player/${initialLeftPlayer.playerId}?season=${leftSelectedSeason}`)}
          >
            ← Back to Player
          </button>
        ) : null}
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
          onClick={() => router.push('/')}
        >
          {initialLeftPlayer ? 'Home' : '← Back to Home'}
        </button>
      </div>

      {/* Comparison Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center">Player Comparison</h1>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        
        {/* Left Player */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {showLeftPlayerSearch ? (
            /* Player Search State */
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Select Player</h2>
              <PlayerSearch 
                onPlayerSelect={(player) => {
                  setSelectedLeftPlayer(player);
                  setShowLeftPlayerSearch(false);
                }}
                placeholder="Search for a player..."
              />
            </div>
          ) : (
            /* Selected Player State */
            <>
              <div className="text-white p-6" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 mb-4 bg-gray-700">
                    <Image 
                      src={!leftImageError && leftPlayerInfo?.headshot_url ? leftPlayerInfo.headshot_url : getDefaultImageUrl()}
                      alt={leftPlayerInfo?.player_display_name || ''}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={() => {
                        if (!leftImageError) setLeftImageError(true); 
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{leftPlayerInfo?.player_display_name}</h2>
                    <div className="text-lg text-gray-300 mt-1">{leftPlayerInfo?.position} • {leftPlayerInfo?.recent_team}</div>
                    
                    <div className="mt-4 flex gap-3 items-end">
                      <div className="flex-1">
                        <select
                          id="leftSeason"
                          value={leftSelectedSeason || ''}
                          onChange={handleLeftSeasonChange}
                          className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {leftSeasons.map((season) => (
                            <option key={season} value={season}>{season}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => {
                          setShowLeftPlayerSearch(true);
                        }}
                      >
                        Change Player
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Player Stats */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Rankings for {leftSelectedSeason}</h3>
                {!leftStats || !leftPercentiles ? (
                  <div className="text-gray-500">No stats available for the selected season.</div>
                ) : (
                  <div className="space-y-4">
                    {leftStatDefinitions.map((statDef) => { 
                      if (leftPercentiles[statDef.key] === undefined) return null;
                      
                      return (
                        <PercentileSlider 
                          key={statDef.key}
                          stat={statDef} 
                          percentile={leftPercentiles[statDef.key]}
                          value={leftStats[statDef.key]}
                          playerId={selectedLeftPlayer?.player_id || initialLeftPlayer?.playerId || ''}
                          season={leftSelectedSeason || 0}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Player */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {!selectedRightPlayer ? (
            /* Player Search State */
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Select Player to Compare</h2>
              <PlayerSearch 
                onPlayerSelect={(player) => setSelectedRightPlayer(player)}
                placeholder="Search for a player to compare..."
              />
            </div>
          ) : (
            /* Selected Player State */
            <>
              <div className="text-white p-6" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 mb-4 bg-gray-700">
                    <Image 
                      src={!rightImageError && rightPlayerInfo?.headshot_url ? rightPlayerInfo.headshot_url : getDefaultImageUrl()}
                      alt={rightPlayerInfo?.player_display_name || ''}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={() => {
                        if (!rightImageError) setRightImageError(true); 
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{rightPlayerInfo?.player_display_name}</h2>
                    <div className="text-lg text-gray-300 mt-1">{rightPlayerInfo?.position} • {rightPlayerInfo?.recent_team}</div>
                    
                    <div className="mt-4 flex gap-3 items-end">
                      <div className="flex-1">
                        <select
                          id="rightSeason"
                          value={rightSelectedSeason || ''}
                          onChange={handleRightSeasonChange}
                          className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {rightSeasons.map((season) => (
                            <option key={season} value={season}>{season}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => {
                          setSelectedRightPlayer(null);
                          setRightPlayerData(null);
                          setRightSelectedSeason(null);
                        }}
                      >
                        Change Player
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Player Stats */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Rankings for {rightSelectedSeason}</h3>
                {!rightStats || !rightPercentiles ? (
                  <div className="text-gray-500">No stats available for the selected season.</div>
                ) : (
                  <div className="space-y-4">
                    {rightStatDefinitions.map((statDef) => { 
                      if (rightPercentiles[statDef.key] === undefined) return null;
                      
                      return (
                        <PercentileSlider 
                          key={statDef.key}
                          stat={statDef} 
                          percentile={rightPercentiles[statDef.key]}
                          value={rightStats[statDef.key]}
                          playerId={selectedRightPlayer.player_id}
                          season={rightSelectedSeason || 0}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
