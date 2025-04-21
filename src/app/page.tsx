import PlayerSearch from '@/components/PlayerSearch';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8 text-center">NFL Stats Radar</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Visualize NFL player statistics with Baseball Savant-inspired percentile rankings
      </p>
      <PlayerSearch />
    </div>
  );
}
