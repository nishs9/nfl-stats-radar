'use client';

import { Suspense, useEffect, useState } from 'react';
import StatComparisonChart from '@/components/StatComparisonChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Player } from '@/types/player';

type PageProps = {
  params: Promise<{
    playerId: string;
    season: string;
    statType: string;
  }>;
}

type ClientProps = {
  playerId: string;
  season: string;
  statType: string;
}

function ClientComponent({ playerId, season, statType }: ClientProps) {
  const [playerInfo, setPlayerInfo] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNames, setShowNames] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlayerInfo = async () => {
      try {
        const response = await fetch(`/api/player/${playerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch player info');
        }
        const data = await response.json();
        setPlayerInfo(data.playerInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchPlayerInfo();
  }, [playerId]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!playerInfo) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Toggle for showing names */}
      <div className="mb-4 flex items-center gap-2">
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
      
      <Suspense fallback={<LoadingSpinner />}>
        <StatComparisonChart
          playerId={playerId}
          position={playerInfo.position}
          season={parseInt(season)}
          statType={statType}
          showNames={showNames}
        />
      </Suspense>
    </div>
  );
}

export default async function StatComparisonPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ClientComponent {...resolvedParams} />;
} 