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
      <Suspense fallback={<LoadingSpinner />}>
        <StatComparisonChart
          playerId={playerId}
          position={playerInfo.position}
          season={parseInt(season)}
          statType={statType}
        />
      </Suspense>
    </div>
  );
}

export default async function StatComparisonPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ClientComponent {...resolvedParams} />;
} 