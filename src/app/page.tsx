import PlayerSearch from '@/components/PlayerSearch';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-16 px-6 sm:px-8 lg:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
          <div className="bg-gray-800 text-white p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-20 h-20">
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
              <p className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl">
                View and visualize NFL player statistics
              </p>
            </div>
          </div>
          
          <div className="px-8 pt-8 pb-48 bg-white flex flex-col items-center justify-start space-y-4">
            <p className="text-gray-600 text-lg">
              Search for a player to get started.
            </p>
            <div className="w-full max-w-2xl relative">
              <PlayerSearch />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
