import PlayerSearch from '@/components/PlayerSearch';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Dark header section */}
      <div className="w-full bg-gray-800 text-white flex flex-col items-center py-12 px-4">
        <div className="relative w-20 h-20 mb-2">
          <Image
            src="/site_logo.jpg"
            alt="NFL Stats Radar Logo"
            width={96}
            height={96}
            priority
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-center">NFL Stats Radar</h1>
        <p className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl mt-2">
          View and visualize NFL player statistics
        </p>
      </div>
      {/* Search bar on light background */}
      <div className="flex flex-col items-center justify-start flex-1 py-12 px-4">
        <div className="w-full max-w-md mx-auto">
          <PlayerSearch />
        </div>
      </div>
    </div>
  );
}
