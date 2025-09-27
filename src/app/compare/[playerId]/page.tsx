'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import PlayerComparison from '@/components/PlayerComparison';

export default function PlayerComparisonPage({params}: {params: Promise<{ playerId: string }>}) {
  const searchParams = useSearchParams();
  const leftPlayerId = use(params).playerId;
  const season = searchParams.get('season');

  return (
    <PlayerComparison 
      initialLeftPlayer={{
        playerId: leftPlayerId,
        season: season ? Number(season) : undefined
      }}
    />
  );
}